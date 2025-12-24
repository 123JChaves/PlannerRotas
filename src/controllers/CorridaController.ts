import express, { Request, Response } from "express";
import { Between, In, JsonContains } from "typeorm";
import { AppDataSource } from "../data-source";
import { Corrida } from "../models/Corrida";
import { RotaIda } from "../models/RotaIda";
import { RotaVolta } from "../models/RotaVolta";
import { Funcionario } from "../models/Funcionario";
import { Solicitacao } from "../models/Solicitacao";
import { Empresa } from "../models/Empresa";
import { Escala } from "../models/Escala";

const router = express.Router();

router.get("/corrida", async (req: Request, res: Response) => {
    try {
        const corridaRepository = AppDataSource.getRepository(Corrida);
        
        const empresaId = req.query.empresaId;
        const pagina = parseInt(req.query.pagina as string) || 1;
        const limite = parseInt(req.query.limite as string) || 10;
        const pular = (pagina - 1) * limite;

        const [corridas, total] = await corridaRepository.findAndCount({
            where: empresaId ? { empresa: { id: Number(empresaId) } } : {},
            relations: [
                "motorista", 
                "motorista.carros", // Útil para saber qual carro foi usado
                "empresa", 
                "funcionarios", 
                "funcionarios.logradouro", // Essencial para o mapa no front-end
                "rotaIda", 
                "rotaVolta"
            ],
            order: { inicioDaCorrida: "DESC" },
            take: limite,
            skip: pular
        });

        return res.status(200).json({
            dados: corridas,
            meta: {
                totalRegistros: total,
                paginaAtual: pagina,
                totalPaginas: Math.ceil(total / limite),
                itensPorPagina: limite
            }
        });

    } catch (error) {
        console.error("Erro ao listar corridas com paginação:", error);
        return res.status(500).json({ message: "Erro ao listar corridas!" });
    }
});

router.post("/corridas/processar-solicitacoes", async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
        const { empresaId, motoristaIds, funcionarioIds, tipoRota } = req.body;

        await queryRunner.connect();
        await queryRunner.startTransaction();

        // 1. Busca funcionários (seu código original)
        const funcionarios = await queryRunner.manager.getRepository(Funcionario).find({
            where: { id: In(funcionarioIds) },
            relations: ["logradouro"]
        });

        // ... (Lógica de ordenação e grupos de 4 permanece igual) ...
        const funcionariosComCoordenadas = funcionarios.filter(f => f.logradouro?.latitude != null);
        const funcionariosOrdenados = funcionariosComCoordenadas.sort((a, b) => Number(a.logradouro.latitude) - Number(b.logradouro.latitude));
        
        const gruposDeQuatro = [];
        for (let i = 0; i < funcionariosOrdenados.length; i += 4) {
            gruposDeQuatro.push(funcionariosOrdenados.slice(i, i + 4));
        }

        const resultados = [];

        for (let index = 0; index < gruposDeQuatro.length; index++) {
            const grupo = gruposDeQuatro[index];
            const motoristaId = motoristaIds[index] || motoristaIds[0];

            const novaCorrida = queryRunner.manager.getRepository(Corrida).create({
                empresa: { id: empresaId },
                motorista: { id: motoristaId },
                funcionarios: grupo,
                inicioDaCorrida: new Date()
            });

            // Criação da Rota (Seu código original)
            if (tipoRota === "IDA") {
                novaCorrida.rotaIda = await queryRunner.manager.save(RotaIda, {
                    funcionarios: grupo,
                    empresa: { id: empresaId },
                    ordemDasParadas: grupo.map(f => f.id).join(",")
                });
            } else {
                // Adicionamos a VOLTA para consistência
                novaCorrida.rotaVolta = await queryRunner.manager.save(RotaVolta, {
                    funcionarios: grupo,
                    empresa: { id: empresaId },
                    ordemDasParadas: grupo.map(f => f.id).join(",")
                });
            }

            const corridaFinal = await queryRunner.manager.save(novaCorrida);

            // --- AQUI ESTÁ A "BAIXA AUTOMÁTICA" ---
            // Se existirem solicitações pendentes para esses funcionários neste dia,
            // nós as marcamos como processadas para que não fiquem "duplicadas".
            const idsFuncs = grupo.map(f => f.id);
            await queryRunner.manager.update(Solicitacao,
                { 
                    funcionario: { id: In(idsFuncs) }, 
                    processada: false,
                    tipoRota: tipoRota 
                },
                { 
                    processada: true, 
                    corrida: corridaFinal 
                }
            );

            resultados.push(corridaFinal);
        }

        await queryRunner.commitTransaction();
        return res.status(201).json({ message: "Corridas manuais geradas e solicitações baixadas.", corridas: resultados });

    } catch (error: any) {
        await queryRunner.rollbackTransaction();
        return res.status(500).json({ message: error.message });
    } finally {
        await queryRunner.release();
    }
});


router.post("/solicitacoes/gerar-lote", async (req: Request, res: Response) => {
    try {
        const { empresaId, funcionarioIds, tipoRota, dataHoraAgendada } = req.body;
        const solicitacaoRepo = AppDataSource.getRepository(Solicitacao);

        const novasSolicitacoes = funcionarioIds.map((id: number) => {
            return solicitacaoRepo.create({
                empresa: { id: empresaId },
                funcionario: { id: id },
                tipoRota: tipoRota,
                dataHoraAgendada: new Date(dataHoraAgendada),
                processada: false
            });
        });

        await solicitacaoRepo.save(novasSolicitacoes);
        return res.status(201).json({ message: "Solicitações agendadas com sucesso." });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
});

router.post("/corridas/processar-janela-solicitacoes", async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
        const { empresaId, tipoRota, dataHoraBase, janelaMinutos } = req.body;
        const inicioJanela = new Date(dataHoraBase);
        const fimJanela = new Date(inicioJanela.getTime() + (janelaMinutos || 0) * 60000);
        
        const dataEscala = inicioJanela.toISOString().split('T')[0];

        await queryRunner.connect();
        await queryRunner.startTransaction();

        // 1. Busca a Escala
        const escala = await queryRunner.manager.findOne(Escala, { where: { data: dataEscala } });
        if (!escala || !escala.motoristaIds?.length) {
            return res.status(400).json({ message: "Escala não definida para este dia." });
        }

        // 2. Valida Empresa
        const empresa = await queryRunner.manager.findOne(Empresa, { where: { id: empresaId }, relations: ["logradouro"] });
        if (!empresa?.logradouro?.latitude) {
            return res.status(400).json({ message: "GPS da empresa não configurado." });
        }

        // 3. Busca solicitações pendentes
        const solicitacoes = await queryRunner.manager.find(Solicitacao, {
            where: {
                empresa: { id: empresaId },
                tipoRota,
                processada: false,
                dataHoraAgendada: Between(inicioJanela, fimJanela)
            },
            relations: ["funcionario", "funcionario.logradouro"]
        });

        const validas = solicitacoes.filter(s => s.funcionario?.logradouro?.latitude != null);
        if (validas.length === 0) return res.status(200).json({ message: "Sem solicitações válidas." });

        // 4. Agrupamento e Cálculo de Peso (Distância)
        const gruposCalculados = [];
        validas.sort((a, b) => Number(a.funcionario.logradouro.latitude) - Number(b.funcionario.logradouro.latitude));

        for (let i = 0; i < validas.length; i += 4) {
            const lote = validas.slice(i, i + 4);
            const peso = Math.max(...lote.map(s => {
                const dLat = Number(empresa.logradouro.latitude) - Number(s.funcionario.logradouro.latitude);
                const dLon = Number(empresa.logradouro.longitude) - Number(s.funcionario.logradouro.longitude);
                return Math.sqrt(dLat * dLat + dLon * dLon);
            }));
            gruposCalculados.push({ lote, peso });
        }

        // 5. Ordena: Mais longe para o mais perto
        gruposCalculados.sort((a, b) => b.peso - a.peso);

        const resultados = [];
        const motoristasDisponiveis = escala.motoristaIds;

        // 6. Processamento Limitado à Escala (Sem Loop)
        // O loop percorre os grupos, mas para se os motoristas acabarem
        for (let i = 0; i < gruposCalculados.length; i++) {
            
            // SE NÃO HÁ MAIS MOTORISTAS, INTERROMPE A CRIAÇÃO
            if (i >= motoristasDisponiveis.length) break;

            const { lote } = gruposCalculados[i];
            const funcionarios = lote.map(s => s.funcionario);
            const motoristaId = motoristasDisponiveis[i];

            // Salva Rota
            const rota = await queryRunner.manager.save(tipoRota === "IDA" ? RotaIda : RotaVolta, {
                funcionarios,
                empresa: { id: empresaId },
                ordemDasParadas: funcionarios.map(f => f.id).join(",")
            });

            // Salva Corrida
            const corrida = await queryRunner.manager.save(Corrida, {
                empresa: { id: empresaId },
                motorista: { id: motoristaId },
                funcionarios,
                rotaIda: tipoRota === "IDA" ? rota : null,
                rotaVolta: tipoRota === "VOLTA" ? rota : null,
                inicioDaCorrida: inicioJanela
            });

            // Baixa nas Solicitações
            await queryRunner.manager.update(Solicitacao,
                { id: In(lote.map(s => s.id)) },
                { processada: true, corrida }
            );

            resultados.push(corrida);
        }

        await queryRunner.commitTransaction();

        const totalProcessados = resultados.length;
        const totalPendente = gruposCalculados.length - totalProcessados;

        return res.status(201).json({ 
            message: `Processamento concluído.`,
            corridasGeradas: totalProcessados,
            gruposRestantesSemMotorista: totalPendente,
            status: totalPendente > 0 ? "ATENÇÃO: Existem solicitações pendentes sem motorista na escala." : "OK"
        });

    } catch (error: any) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        return res.status(500).json({ message: error.message });
    } finally {
        await queryRunner.release();
    }
});

export default router;