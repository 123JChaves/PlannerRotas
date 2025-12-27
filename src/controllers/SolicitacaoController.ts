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
        const { empresaId, funcionarioIds, tipoRota, dataHoraAgendada } = req.body;
        const solicitacaoRepository = AppDataSource.getRepository(Solicitacao);

        const novasSolicitacoes = funcionarioIds.map((id: number) =>
            solicitacaoRepository.create({
                empresa: { id: empresaId },
                funcionario: { id: id },
                tipoRota,
                dataHoraAgendada: new Date(dataHoraAgendada),
                processada: false
            })
        );

        await solicitacaoRepository.save(novasSolicitacoes);
        return res.status(201).json({ message: "Solicitações agendadas." });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;