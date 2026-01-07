import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Solicitacao } from "../models/Solicitacao";
import { SolicitacaoCancelamento } from "../models/SolicitacaoCancelamento";

const router = express.Router();

// Listar todas as solicitações (trazendo o endereço junto)
router.get("/solicitacoes", async (req: Request, res: Response) => {
    try {
        const solicitacaoRepo = AppDataSource.getRepository(Solicitacao);

        // 1. Recupera as solicitações incluindo a relação profunda com Pessoa
        const solicitacoes = await solicitacaoRepo.find({
            relations: [
                "funcionario", 
                "funcionario.pessoa", // Adicionado para carregar Nome e CPF da nova estrutura
                "empresa", 
                "corrida"
            ],
            order: {
                dataHoraAgendada: "DESC" 
            }
        });

        // 2. Formata a resposta para garantir que o nome apareça corretamente no JSON
        const solicitacoesFormatadas = solicitacoes.map(s => ({
            ...s,
            funcionario: {
                ...s.funcionario,
                // Fallback para caso o registro de pessoa tenha sido deletado (LGPD)
                nome: s.funcionario?.pessoa?.nome || "Funcionário não identificado",
                cpf: s.funcionario?.pessoa?.cpf || "N/A"
            }
        }));

        return res.status(200).json(solicitacoesFormatadas);
    } catch (error: any) {
        return res.status(500).json({ 
            message: "Erro ao recuperar solicitações: " + error.message 
        });
    }
});

// Rota para gerar lotes de solicitações para serem consumidos pela API de corrida:
router.post("/solicitacoes/gerar-lote", async (req: Request, res: Response) => {
    try {
        const { empresaId, funcionarioIds, tipoRota, dataHoraAgendada } = req.body;

        // 1. Validação de entrada
        if (!empresaId || !funcionarioIds || !Array.isArray(funcionarioIds) || !dataHoraAgendada) {
            return res.status(400).json({ message: "Dados incompletos para o agendamento em lote." });
        }

        const solicitacaoRepository = AppDataSource.getRepository(Solicitacao);
        const dataFormatada = new Date(dataHoraAgendada);

        // 2. Mapeamento para entidades
        // Nota: O TypeORM aceita objetos parciais com apenas o ID para relações ManyToOne
        const novasSolicitacoes = funcionarioIds.map((id: number) => 
            solicitacaoRepository.create({
                empresa: { id: Number(empresaId) },
                funcionario: { id: Number(id) },
                tipoRota,
                dataHoraAgendada: dataFormatada,
                processada: false
            })
        );

        // 3. Inserção em lote (Bulk Insert)
        // Usar .save() em vez de .insert() é mais seguro se você precisar 
        // disparar Listeners ou se as entidades tiverem regras complexas.
        await solicitacaoRepository.save(novasSolicitacoes);

        return res.status(201).json({ 
            message: `${novasSolicitacoes.length} solicitações agendadas com sucesso para ${dataFormatada.toLocaleString('pt-BR')}.`,
            total: novasSolicitacoes.length
        });

    } catch (error: any) {
        console.error("Erro ao gerar lote:", error);
        
        // Tratamento de erro de chave estrangeira (Comum em 2026)
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: "Um ou mais IDs de funcionários ou empresa são inválidos." });
        }

        return res.status(500).json({ message: "Erro interno ao processar o lote.", error: error.message });
    }
});

// Rota para cancelar a solicitação via modificação de status:
router.patch("/solicitacoes/:id/cancelar", async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const { id } = req.params;
        const { motivo } = req.body;
        const solicitacaoId = Number(id);

        const solicitacaoRepo = queryRunner.manager.getRepository(Solicitacao);
        const cancelamentoRepo = queryRunner.manager.getRepository(SolicitacaoCancelamento);

        // 1. Busca a solicitação carregando as relações necessárias
        const solicitacao = await solicitacaoRepo.findOne({ 
            where: { id: solicitacaoId },
            relations: ["funcionario", "funcionario.pessoa"] 
        });

        if (!solicitacao) {
            await queryRunner.rollbackTransaction();
            return res.status(404).json({ message: "Solicitação não encontrada." });
        }

        if (solicitacao.processada) {
            // Regra de negócio: Se já foi processada em uma corrida, talvez precise de lógica extra
            // Aqui apenas avisamos, ou você pode permitir o cancelamento mesmo assim.
        }

        // 2. Registro na tabela de auditoria
        // Adicionamos a lógica para carimbar quem era o funcionário no momento do cancelamento
        const novoCancelamento = cancelamentoRepo.create({
            motivo: motivo || "Cancelamento solicitado pelo usuário",
            solicitacao: solicitacao,
            // Sugestão: salvar o nome do funcionário no cancelamento para histórico imutável
            nomeFuncionarioSnapshot: solicitacao.funcionario?.pessoa?.nome || "N/A"
        });

        await cancelamentoRepo.save(novoCancelamento);

        // 3. Atualiza o status e limpa vínculos
        // Definimos cancelada: true e garantimos que ela não seja mais processada
        await solicitacaoRepo.update(solicitacaoId, { 
            cancelada: true,
            processada: true, // Marcamos como processada para o motor de rota ignorá-la
            corrida: null as any // Desvincula de qualquer corrida caso já estivesse associada
        });

        await queryRunner.commitTransaction();
        return res.status(200).json({ 
            message: "Cancelamento registrado e auditoria gerada com sucesso.",
            solicitacaoId: solicitacaoId
        });

    } catch (error: any) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        console.error("Erro no cancelamento:", error); 
        return res.status(500).json({ message: "Erro interno: " + error.message });
    } finally {
        await queryRunner.release();
    }
});

// Rota para deletar a solicitação:
router.delete("/solicitacoes", async (req: Request, res: Response) => {
    try {
        const { ids } = req.body; // Espera um array: { "ids": [10, 11] }

        const solicitacaoRepository = AppDataSource.getRepository(Solicitacao);
        
        // 1. Verificar se as solicitações existem e se já foram processadas
        const solicitacoes = await solicitacaoRepository.findByIds(ids);
        
        const jaProcessadas = solicitacoes.filter(s => s.processada);
        if (jaProcessadas.length > 0) {
            return res.status(400).json({ 
                message: "Algumas solicitações já estão em corrida e não podem ser canceladas por aqui." 
            });
        }

        // 2. Deletar do banco
        await solicitacaoRepository.delete(ids);

        return res.status(200).json({ message: "Agendamento(s) cancelado(s) com sucesso." });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao cancelar solicitação." });
    }
});

export default router;