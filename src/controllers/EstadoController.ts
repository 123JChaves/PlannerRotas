import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Estado } from "../models/Estado";
import { Pais } from "../models/Pais";
import { Not } from "typeorm";

const router = express.Router()

//Rota para visualização dos estados:
router.get("/estado", async (req: Request, res: Response) => {
    try {
        const estadoRepository = AppDataSource.getRepository(Estado);
        const estado = await estadoRepository.findOne({
            relations: [
                "pais"
            ],
        });
        return res.status(200).json(estado);

    } catch (error:any) {
        console.error(error);

        return res.status(500).json({
            message: "Erro interno ao listar os estados!"
        });
    }
});

//Rota para a visualização dos estados por IDs:
router.get("/estado/:id", async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const estadoRepository = AppDataSource.getRepository(Estado);

        const estado = await estadoRepository.findOne({
            where: {id: Number(id)},
            relations: [
                "pais"
            ],
        });

        if(!estado) {
            return res.status(404).json({
                message: "Estado não encontrado!"
            });
        }

        return res.status(200).json(estado);

    } catch (error:any) {
        console.error(error);

        return res.status(500).json({
            message: "Erro interno ao buscar o estado!"
        });
    }
});

// Rota para cadastrar estados:
router.post("/estado", async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const estadoRepository = AppDataSource.getRepository(Estado);
        const paisRepository = AppDataSource.getRepository(Pais);

        // 1. Validação básica
        if (!data.nome || !data.pais) {
            return res.status(400).json({
                message: "O nome do estado e os dados do país são obrigatórios." 
            });
        }

        // 2. Lógica "Buscar ou Criar" para o País
        // Evita erro de duplicidade se o País já existir no banco
        if (data.pais && !data.pais.id && data.pais.nome) {
            const paisExistente = await paisRepository.findOne({
                where: { nome: data.pais.nome }
            });

            if (paisExistente) {
                // Se o país já existe, vinculamos pelo ID para evitar tentativa de INSERT duplicado
                data.pais = { id: paisExistente.id };
            }
        }

        // 3. Verifica se o Estado já existe dentro desse País
        // Respeita a Constraint @Unique(["nome", "pais"])
        const estadoExistente = await estadoRepository.findOne({
            where: {
                nome: data.nome,
                pais: data.pais.id ? { id: data.pais.id } : { nome: data.pais.nome }
            }
        });

        if (estadoExistente) {
            return res.status(400).json({
                message: "Este estado já está cadastrado para este país."
            });
        }

        // 4. Criação e Salvamento
        // O cascade: true cuidará de criar o País caso ele não tenha sido encontrado no passo 2
        const novoEstado = estadoRepository.create(data);
        await estadoRepository.save(novoEstado);

        return res.status(201).json({
            message: "Estado cadastrado com sucesso!",
            novoEstado
        });

    } catch (error: any) {
        console.error(error);
        
        // Tratamento para erro de duplicidade (segurança extra do banco)
        if (error.message.includes("Duplicate entry")) {
            return res.status(400).json({
                message: "Erro: Este estado já existe para o país informado."
            });
        }

        return res.status(500).json({ message: "Erro ao cadastrar o estado: " + error.message });
    }
});

// Rota para a edição do estado:
router.put("/estado/:id", async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const data = req.body;
        const estadoRepository = AppDataSource.getRepository(Estado);

        const estado = await estadoRepository.findOne({
            where: {id: Number(id)},
            relations: [
                "pais"
            ],
        });

        if(!estado) {
            return res.status(404).json({
                message: "Estado não encontrado!"
            });
        }

        if(data.nome || data.pais) {
            const nomeVerificacao = data.nome || estado.nome;

            const paisIdVerificacao = data.pais?.id || estado.pais?.id;

            if(paisIdVerificacao) {
                const conflito = await estadoRepository.findOne({
                    where: {
                        nome: nomeVerificacao,
                        pais: {id: paisIdVerificacao},
                        id: Not(Number(id))
                    }
                });
                if(conflito) {
                    return res.status(400).json({
                        message: "Já existe outro estado cadastrado neste mesmo país!"
                    });
                }
            }
        }

        estadoRepository.merge(estado, data);
        await estadoRepository.save(estado);

        return res.status(200).json({
            message: "Estado atualizado com sucesso!",
            estadoEdit: estado,
        });
        
    } catch (error:any) {
        console.error(error);

        if(error.message && error.message.includes("Duplicate entry")) {
            return res.status(400).json({
                message: "Erro: este estado já existe para o país selecionado!"
            });
        }

        return res.status(500).json({
            message: "Erro interno ao cadastrar o estado!"
        });
    }
});

// Rota para a exclusão de estado:
router.delete("/estado/:id", async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const estadoRepository = AppDataSource.getRepository(Estado);
        const estado = await estadoRepository.findOne({
            where: {id: Number(id)}
        });

        if(!estado) {
            return res.status(404).json({
                message: "Estad não econtrado!"
            });
        }

        await estadoRepository.remove(estado);

        return res.status(200).json({
            message: "Estado excluído com sucesso!",
            estadoDeletado: estado,
        });

    } catch (error:any) {
        console.error(error);

        if(error.code === "ER_ROW_REFERENCE_2" || error.message.includes("foreign key constraint")) {
            return res.status(400).json({
                message: "Não é possível excluir: este estado está sendo usado em outras entidades! "
            });
        }

        return res.status(500).json({
            message: "Erro interno ao excluir o estado!"
        });
    }
});

export default router;