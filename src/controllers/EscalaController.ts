
import express, { Request, Response } from "express"; 
import { AppDataSource } from "../data-source";
import { Escala } from "../models/Escala";

const router = express.Router()

router.get("/escalas", async (req: Request, res: Response) => {
    try {
        const { data } = req.query;
        const repo = AppDataSource.getRepository(Escala);

        if (data) {
            const escala = await repo.findOne({ where: { data: String(data) } });
            if (!escala) return res.status(404).json({ message: "Escala não encontrada para esta data." });
            return res.json(escala);
        }

        const escalas = await repo.find({ order: { data: "DESC" } });
        return res.json(escalas);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar escalas." });
    }
});

router.post("/escalas/gerar-dia", async (req: Request, res: Response) => {
    try {
        const { dataBr, motoristaIds } = req.body; // Recebe "23/12/2025"

        // Converte "23/12/2025" para "2025-12-23" (Formato ISO/MySQL)
        const [dia, mes, ano] = dataBr.split('/');
        const dataFormatada = `${ano}-${mes}-${dia}`;

        const repo = AppDataSource.getRepository(Escala);

        // Opcional: Remove escala anterior da mesma data para evitar duplicidade
        await repo.delete({ data: dataFormatada });

        const novaEscala = repo.create({
            data: dataFormatada,
            motoristaIds
        });

        await repo.save(novaEscala);

        return res.status(201).json({ 
            message: "Escala salva com sucesso!",
            dataGravada: dataFormatada,
            motoristas: motoristaIds
        });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao processar data. Certifique-se de usar DD/MM/YYYY" });
    }
});

export default router;