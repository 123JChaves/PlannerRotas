import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Solicitacao } from "../models/Solicitacao";

const router = express.Router();

// Listar todas as solicitações (trazendo o endereço junto)
router.get("/solicitacoes", async (req: Request, res: Response) => {
    try {
        const solicitacaoRepo = AppDataSource.getRepository(Solicitacao);

        // Recupera todas as solicitações com seus relacionamentos
        const solicitacoes = await solicitacaoRepo.find({
            relations: ["funcionario", "empresa", "corrida"],
            order: {
                dataHoraAgendada: "DESC" // Ordena pelas mais recentes
            }
        });

        return res.status(200).json(solicitacoes);
    } catch (error: any) {
        return res.status(500).json({ 
            message: "Erro ao recuperar solicitações: " + error.message 
        });
    }
});

// Rota para gerar solicitações em lote (usando o método .save())
router.post("/solicitacoes/gerar-lote", async (req: Request, res: Response) => {
    try {
        // Recebe os dados da seleção feita no front-end
        const { empresaId, funcionarioIds, tipoRota, dataHoraAgendada } = req.body;

        // 1. Instancia o repositório
        const solicitacaoRepo = AppDataSource.getRepository(Solicitacao);

        // 2. Cria os objetos de solicitação baseados nos funcionários selecionados
        const novasSolicitacoes = funcionarioIds.map((id: number) => {
            return solicitacaoRepo.create({
                empresa: { id: empresaId },
                funcionario: { id: id },
                tipoRota: tipoRota, // "IDA" ou "VOLTA"
                dataHoraAgendada: new Date(dataHoraAgendada), // Ex: 2025-12-24T03:00:00.000Z
                processada: false // Define como pendente para o processador de corridas
            });
        });

        // 3. Salva no banco de dados
        const salvas = await solicitacaoRepo.save(novasSolicitacoes);

        return res.status(201).json({
            message: `${salvas.length} solicitações criadas com sucesso.`,
            solicitacoes: salvas
        });

    } catch (error: any) {
        return res.status(500).json({ message: "Erro ao gerar solicitações: " + error.message });
    }
});

export default router;