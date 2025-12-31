import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Categoria } from "../models/Categoria";
import { Not } from "typeorm";

const router = express.Router();

//Rota para recuperar todas as categorias
router.get("/categoria", async (req: Request, res: Response) => {
    try {
        const categoriaRepository = AppDataSource.getRepository(Categoria)
        const categoria = await categoriaRepository.find();

        return res.status(200).json(categoria);
    } catch (error:any) {
        console.error(error);
        return res.status(500).json({
            message: "Erro ao listar as categorias!"
        });
    };
});

//Rota para recuperar a categoria por id
router.get("/categoria/id", async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const categoriaRepository = AppDataSource.getRepository(Categoria)
        const categoria = await categoriaRepository.findOne({
            where: {id: Number(id)},
            relations: ["carros"]
        });

        if(!categoria) {
            return res.status(404).json({
                message: "Categoria não encontrada!"
            })
        } return res.status(200).json(categoria);
    } catch (error:any) {
        console.error(error);
        return res.status(500).json({
            message: "Erro interno ao buscar a categoria!"
        });
    };
});

router.post("/categoria", async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const categoriaRepository = AppDataSource.getRepository(Categoria);

        const existingCategoria = await categoriaRepository.find({
            where: {categoria: data.categoria},
        });

        if(existingCategoria) {
            return res.status(400).json({
                message: "Categoria já cadastrada!"
            });
        };

        const novaCategoria = categoriaRepository.create(data);
        await categoriaRepository.save(novaCategoria);

        return res.status(201).json({
            message: "Categoria cadastrada com sucesso!",
            categoria: novaCategoria,
        });
    } catch (error:any) {
        console.error(error);
        return res.status(500).json({
            message: "Erro interno ao cadastrar a categoria!"
        });
    };
});

router.put("/categoria/:id", async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const data = req.body;
        const categoriaId = parseInt(id);
        const categoriaRepository = AppDataSource.getRepository(Categoria);
        const categoria = await categoriaRepository.findOneBy({
            id: Number(id)
        });

        if(!categoria) {
            return res.status(404).json({
                message: "Categoria não encontrada!"
            });
        }

        if(data.categoria) {
            const existingCategoria = await categoriaRepository.findOne({
                where: {
                    categoria: data.categoria,
                    id: Not(categoriaId)
                }
            });

            if(existingCategoria) {
                return res.status(400).json({
                    message: "Categoria já cadastrada!"
                });
            };
        }

        categoriaRepository.merge(categoria, data);
        const atualizacaoCategoria = await categoriaRepository.save(categoria);

        return res.status(200).json({
            message: "Categoria atualizada com sucesso!",
            categoria: atualizacaoCategoria,
        });
        
    } catch (error:any) {
        console.error(error);

        if(error.message && error.message.includes("Duplicade entry")) {
            return res.status(400).json({
                message: "Erro: Esta categoria já está cadastrada!",
            });
        };

        return res.status(500).json({
            message: "Erro interno ao editar a categoria!"
        })
    }
});

router.delete("/categoria/:id", async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const categoriaRepository = AppDataSource.getRepository(Categoria);

        const categoria = await categoriaRepository.findOne({
            where: {id: Number(id)},
        });

        if(!categoria) {
            return res.status(404).json({
                message: "Categoria não encontrada!"
            });
        };

        await categoriaRepository.remove(categoria);

        return res.status(200).json({
            message: "Categoria removida com sucesso!"
        });
    } catch (error:any) {
        console.error(error);
        return res.status(500).json({
            message: "Erro interno ao deletar a categoria.",
        });
    };
});

export default router;