import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Pais } from "../models/Pais";
import { Not } from "typeorm";

const router = express.Router()

// Rota para a visualização de todos os países:
router.get("/pais", async (req: Request, res: Response) => {
    try {
        const paisRespository = AppDataSource.getRepository(Pais);
        const pais = await paisRespository.find();

        return res.status(200).json(pais);

    } catch (error:any) {
        console.error(error);

        return res.status(500).json({
            message: "Erro interno ao listar os países!"
        });
    }
});

// Rota para a visualização do paíse por IDs:
router.get("/pais/:id", async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const paisRepository = AppDataSource.getMongoRepository(Pais);

        const pais = await paisRepository.findOne({
            where: {id: Number(id)}
        });

        if(!pais) {
            return res.status(404).json({
                message: "País não encontrado!"
            });
        }

        return res.status(200).json(pais);

    } catch (error:any) {
        console.error(error);

        return res.status(500).json({
            message: "Erro interno ao listar o país!"
        });
    }
});

// Rota para cadastrar país:
router.post("/pais", async (req: Request, res: Response) => {
    try {
        const { nome } = req.body;
        const paisRepository = AppDataSource.getRepository(Pais);

        // 1. Validação básica de entrada
        if (!nome) {
            return res.status(400).json({ 
                message: "O nome do país é obrigatório." 
            });
        }

        // 2. Lógica "Buscar ou Criar"
        // Verifica se o país já existe pelo nome para evitar erro de Duplicate Entry
        const paisExistente = await paisRepository.findOne({
            where: { nome: nome }
        });

        if (paisExistente) {
            // Se já existe, retornamos o registro atual. 
            // Você pode optar por retornar erro (400) ou apenas o objeto (200).
            return res.status(200).json({
                message: "Este país já está cadastrado no sistema.",
                pais: paisExistente
            });
        }

        // 3. Criação do novo registro
        const novoPais = paisRepository.create({ nome });
        await paisRepository.save(novoPais);

        return res.status(201).json({
            message: "País cadastrado com sucesso!",
            pais: novoPais
        });

    } catch (error: any) {
        console.error(error);
        
        // Tratamento de segurança caso ocorra uma tentativa simultânea no banco
        if (error.message.includes("Duplicate entry")) {
            return res.status(400).json({ message: "O país informado já existe." });
        }

        return res.status(500).json({ message: "Erro ao cadastrar o país: " + error.message });
    }
});

// Rota para a edição do país:
router.put("/pais/:id", async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const {nome} = req.body;
        const paisRepository = AppDataSource.getRepository(Pais);
        const pais = await paisRepository.findOne({
            where: {id: Number(id)}
        });

        if(!pais) {
            return res.status(404).json({
                message: "País não econtrado!"
            });
        }

        if(nome && nome !== pais.nome) {
            const conflito = await paisRepository.findOne({
                where: {
                    nome: nome,
                    id: Not(Number(id))
                }
            });

            if(conflito) {
                return res.status(400).json({
                    message: "Já existe outro país cadastrado com este nome!"
                });
            }
        }

        paisRepository.merge(pais, req.body);
        await paisRepository.save(pais);

        return res.status(200).json({
            message: "País atualizado com sucesso!",
        });

    } catch (error:any) {
        console.error(error);

        if(error.message && error.message.includes("Duplicate entry")) {
            return res.status(400).json({
                message: "Erro: este país já está em uso!"
            });
        }

        return res.status(500).json({
            message: "Erro interno ao atualizar o país"
        });
    }
});

// Rota para a exclusão do país:
router.delete("/pais/:id", async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const paisRepository = AppDataSource.getRepository(Pais);
        const pais = await paisRepository.findOne({
            where: {id: Number(id)}
        });

        if(!pais) {
            return res.status(404).json({
                message: "País não encontrado!"
            });
        }

        await paisRepository.remove(pais);

        return res.status(200).json({
            message: "País deletado com sucesso!",
            paisDelete: pais
        });

    } catch (error:any) {
        console.error(error);

        if(error.code === "ER_ROW_REFERENCE_2" || error.message.includes("foreign key constraint")) {
            return res.status(400).json({
                message: "Não é possível excluir: este país possui outros dados a ele vinculados!"
            });
        }

        return res.status(500).json({
            message: "Erro interno ao excluír o país!"
        });
    }
});

export default router;