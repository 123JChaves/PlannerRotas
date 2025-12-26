import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Cidade } from "../models/Cidade";
import { Estado } from "../models/Estado";
import { Not } from "typeorm";

const router = express.Router()

// Rota para a visualização de todas as cidades cadastradas:
router.get("/cidade", async (req: Request, res: Response) => {
    try {
        const cidadeRepository = AppDataSource.getRepository(Cidade);
        const cidade = await cidadeRepository.find({
            relations: [
                "estado",
                "estado.pais"
            ],
        });
        return res.status(200).json(cidade);

    } catch (error:any) {
        console.error(error);

        return res.status(500).json({
            message: "Erro interno ao listar as cidades!"
        });
    }
});

// Rota para a visualização das cidades por IDs:
router.get("/cidade/:id", async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const cidadeRespository = AppDataSource.getRepository(Cidade);

        const cidade = await cidadeRespository.findOne({
            where: {id: Number(id)},
            relations: [
                "estado",
                "estado.pais"
            ],
        });

        if(!cidade) {
            return res.status(404).json({
                message: "Cidade não encontrada!"
            });
        }

        return res.status(200).json(cidade);

    } catch (error:any) {
        console.error(error);

        return res.status(500).json({
            message: "Erro interno ao buscar a cidade!"
        });
    }
});

// Rota para o cadastro de cidades:
router.post("/cidade", async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const cidadeRepository = AppDataSource.getRepository(Cidade);
        const estadoRespository = AppDataSource.getMongoRepository(Estado);

        if(!data.nome || !data.estado) {
            return res.status(400).json({
                message: "O nome da cidade e os dados do estado são obrigatórios!"
            });
        }

        if(data.estado && !data.estado.id && data.estado.nome) {
            const estadoExistente = await estadoRespository.findOne({
                where: {
                    nome: data.estado.nome,
                    pais: {nome: data.estado.pais?.nome}
                }
            });
            if(estadoExistente) {
                data.estado = {id: estadoExistente.id};
            }
        }

        const cidadeExistente = await cidadeRepository.findOne({
            where: {
                nome: data.nome,
                estado: data.estado.id? {id: data.estado.id} : {nome: data.estado.nome}
            }
        });
        
        if(cidadeExistente) {
            return res.status(400).json({
                message: "Já existe uma cidade neste estado cadastrada com este nome!"
            });
        }

        const cidade = cidadeRepository.create(data);
        await cidadeRepository.save(cidade);

        return res.status(201).json({
            message: "Cidade cadastrada com sucesso!",
        });

    } catch (error:any) {
        console.error(error);

         if (error.message.includes("Duplicate entry")) {
            return res.status(400).json({
                message: "Erro: Um dos elementos geográficos já existe no banco de dados."
            });
        }

        return res.status(500).json({
            message: "Erro interno: Falha ao cadastrar a cidade"!
        });
    }
})

// Rota para a edição de cidades:
router.put("/cidade/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const cidadeRepository = AppDataSource.getRepository(Cidade);

        // 1. Busca a cidade carregando o estado para ter o ID atual
        const cidade = await cidadeRepository.findOne({
            where: { id: Number(id) },
            relations: [
                "estado",
                "estado.pais"
            ]
        });

        if (!cidade) {
            return res.status(404).json({ 
                message: "Cidade não encontrada!"
            });
        }

        // 2. Validação de Duplicidade (Nome + Estado)
        if (data.nome || data.estado) {
            const nomeVerificacao = data.nome || cidade.nome;
            
            // PRIORIDADE: ID novo vindo do body -> ID atual que já está no banco
            const estadoIdVerificacao = data.estado?.id || cidade.estado?.id;

            // Se tivermos um ID de estado para comparar
            if (estadoIdVerificacao) {
                const conflito = await cidadeRepository.findOne({
                    where: {
                        nome: nomeVerificacao,
                        estado: { id: estadoIdVerificacao }, // Busca sempre pelo ID da relação
                        id: Not(Number(id)) // Ignora a própria cidade que está sendo editada
                    }
                });

                if (conflito) {
                    return res.status(400).json({
                        message: "Já existe outra cidade cadastrada com este nome neste estado!"
                    });
                }
            }
        }

        // 3. Mescla e Salva
        cidadeRepository.merge(cidade, data);
        await cidadeRepository.save(cidade);

        return res.status(200).json({
            message: "Cidade editada com sucesso!",
            cidadeEdit: cidade
        });

    } catch (error: any) {
        console.error(error);

        if (error.message && error.message.includes("Duplicate entry")) {
            return res.status(400).json({
                message: "Erro: Esta cidade já existe para o estado selecionado!"
            });
        }

        return res.status(500).json({
            message: "Erro interno ao atualizar cidade: ",
        });
    }
});

// Rota para a exclusão de cidades:
router.delete("/cidade/:id", async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const cidadeRepository = AppDataSource.getRepository(Cidade);
        const cidade = await cidadeRepository.findOne({
            where: {id: Number(id)}
        });

        if(!cidade) {
            return res.status(404).json({
                message: "Cidade não encontrada"
            });
        }

        await cidadeRepository.remove(cidade);

        return res.status(200).json({
            message: "Cidade deletada com sucesso!",
            cidadeDelete: cidade
        });

    } catch (error:any) {
        console.error(error)

        if(error.code === "ER_ROW_REFERENCE_2" || error.message.includes("foreign key constraint")) {
            return res.status(400).json({
                message: "Não é possível excluir: existem endereços cadastrados nesta cidade!"
            });
        }

        return res.status(500).json({
            message: "Erro interno ao excluir a cidade!"
        });
    }
})

export default router;