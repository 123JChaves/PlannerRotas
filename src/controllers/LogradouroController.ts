import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Logradouro } from "../models/Logradouro";

const router = express.Router();

router.get("/logradouro", async (req: Request, res: Response) => {
    try {
        const logradouroRepository = AppDataSource.getRepository(Logradouro);
        const logradouros = await logradouroRepository.find({
            // Carrega o bairro para saber onde fica o logradouro
            relations: [
                "bairro",
            ]
        });

        return res.status(200).json(logradouros);
    } catch (error: any) {
        return res.status(500).json({ message: "Erro ao listar endereços: " + error.message });
    }
});

// 2. RECUPERAR UM ENDEREÇO ESPECÍFICO POR ID
router.get("/logradouro/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const logradouroRepository = AppDataSource.getRepository(Logradouro);
        const logradouro = await logradouroRepository.findOne({
            where: { id: Number(id) },
            // Carregamos toda a árvore geográfica para o front-end
            relations: [
                "bairro", 
                "bairro.cidade", 
                "bairro.cidade.estado", 
                "bairro.cidade.estado.pais"
            ]
        });

        if (!logradouro) {
            return res.status(404).json({ message: "Endereço não encontrado." });
        }

        return res.status(200).json(logradouro);
    } catch (error: any) {
        return res.status(500).json({ message: "Erro ao buscar endereço: " + error.message });
    }
});

// Rota: PUT /logradouro/:id
router.put("/logradouro/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const logradouroRepository = AppDataSource.getRepository(Logradouro);

        // 1. Busca o logradouro pelo ID
        const logradouro = await logradouroRepository.findOne({ 
            where: {id: Number(id)},
            relations: [
                "bairro",
                "bairro.cidade",
                "bairro.cidade.estado",
                "bairro.cidade.estado.pais"]
        });

        if (!logradouro) {
            return res.status(404).json({ message: "Logradouro não encontrado" });
        }

        // 2. Salva a alteração)faz o merge, que 'mistura' os novos dados, preparando-o para salvar
        // Depois com o método 'save()' é salva a alteração
        await logradouroRepository.merge(logradouro, req.body);

        await logradouroRepository.save(logradouro);

        return res.status(200).json({
            message: "Coordenadas atualizadas com sucesso!",
            logradouro
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;