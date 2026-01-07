import express, { Request, Response } from "express";
import { Not } from "typeorm";
import { AppDataSource } from "../data-source";
import { Bairro } from "../models/Bairro";
import { Cidade } from "../models/Cidade";

const router = express.Router();

//Rota para listar toos os bairros:
router.get("/bairro", async (req: Request, res: Response) => {
    try {
        const bairroRepository = AppDataSource.getRepository(Bairro);
        const bairro = await bairroRepository.find({
            relations: [
                "cidade",
                "cidade.estado",
                "cidade.estado.pais"
            ],
        });
        return res.status(200).json(bairro);

    } catch (error:any) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao listar bairros!" });
    }
});

//Rota para listar bairros por ID:
router.get("/bairro/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const bairroRepository = AppDataSource.getRepository(Bairro);
        const bairro = await bairroRepository.findOne({
            where: {id: parseInt(id)},
            relations: [
                "cidade",
                "cidade.estado",
                "cidade.estado.pais"
            ],
        });
        return res.status(200).json(bairro);
    } catch (error:any) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao listar o bairro!" });
    }
});

//Rota para cadastrar bairro:
router.post("/bairro", async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const bairroRepository = AppDataSource.getRepository(Bairro);
        const cidadeRepository = AppDataSource.getRepository(Cidade);

        if (!data.nome || !data.cidade) {
            return res.status(400).json({ 
                message: "O nome do bairro e os dados da cidade são obrigatórios." 
            });
        }

        if (data.cidade && !data.cidade.id && data.cidade.nome) {
            const cidadeExistente = await cidadeRepository.findOne({
                where: {
                    nome: data.cidade.nome,
                    estado: { nome: data.cidade.estado?.nome }
                }
            });

            if (cidadeExistente) {
                data.cidade = { id: cidadeExistente.id };
            }
        }

        const bairroExistente = await bairroRepository.findOne({
            where: {
                nome: data.nome,
                cidade: data.cidade.id ? { id: data.cidade.id } : { nome: data.cidade.nome }
            }
        });

        if (bairroExistente) {
            return res.status(400).json({
                message: "Já existe um bairro nesta cidade cadastrado com esse nome!"
            });
        }

        // 4. Criação e Salvamento com suporte a Cascade
        const bairro = bairroRepository.create(data);
        await bairroRepository.save(bairro);

        return res.status(201).json({
            message: "Bairro cadastrado com sucesso!",
            novoBairro: bairro
        });

    } catch (error: any) {
        console.error(error);

        // Tratamento para erros de duplicidade nas tabelas superiores (Cidade/Estado/Pais)
        if (error.message.includes("Duplicate entry")) {
            return res.status(400).json({
                message: "Erro: Um dos elementos geográficos já existe no banco de dados."
            });
        }

        return res.status(500).json({ message: "Erro ao cadastrar o bairro!" });
    }
});

// Rota para a edição de bairro:
router.put("/bairro/:id", async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const data = req.body;
        const bairroRespository = AppDataSource.getRepository(Bairro);
        const bairro = await bairroRespository.findOne({
            where: {id: parseInt(id)},
            relations: [
                "cidade",
            ],
        });
        if(!bairro) {
            return res.status(404).json({
                message: "Bairro não encontrado!"
            });
        }
        if(data.nome || data.cidade) {
            const nomeVerificacao = data.nome || bairro.nome;
            const cidadeIdVerificacao = data.cidade?.id || data.bairro?.id;

            const conflito = await bairroRespository.findOne({
                where: {
                    nome: nomeVerificacao,
                    cidade: {id: cidadeIdVerificacao},
                    id: Not(Number(id))
                }
            });
            if(conflito) {
                return res.status(400).json({
                    message: "Já existe um bairro cadastrado com esse nome na cidade selecionada!"
                });
            }
        }
        bairroRespository.merge(bairro, data);
        await bairroRespository.save(bairro);

        return res.status(200).json({
            message: "Bairro editado com sucesso!",
            bairroEdit: bairro
        });
    } catch (error:any) {
        console.error(error);

        if(error.message.includes("Duplicate entry")) {
            return res.status(400).json({
                message: "Erro: Bairro já existente nesta cidade!"
            });
        }
        return res.status(500).json({
            message: "Erro ao atualizar o bairro!" + error.message
        });
    }
});

// Rota para a exclusão de bairro:
router.delete("/bairro/:id", async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const bairroRepository = AppDataSource.getRepository(Bairro)
        const bairro = await bairroRepository.findOneBy({id: Number(id)});

        if(!bairro) {
            return res.status(404).json({
                message: "Bairro não encontrado!"
            });
        }

        await bairroRepository.remove(bairro);

        return res.status(200).json({
            message: "Bairro excluído com sucesso!",
            bairroDeletado: bairro
        });
    } catch (error:any) {
        console.error(error);

        if(error.code === "ER_ROW_REFERENCE_2" || error.message.includes("foreign key constraint")) {
            return res.status(400).json({
                message: "Não é possível excluir: existem logradouros cadastrados neste bairro!"
            });
        }

        return res.status(500).json({
            message: "Erro Interno: Erro ao excluir o bairro!"
        });
    }
});

export default router;