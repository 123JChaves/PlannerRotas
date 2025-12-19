import express, { Request, Response } from "express";
import { Not } from "typeorm";
import { AppDataSource } from "../data-source";
import { Funcionario } from "../models/Funcionario";
import { Logradouro } from "../models/Logradouro";

const router = express.Router();

// Listar todos as funcionarios (trazendo o endereço junto)
router.get("/funcionario", async (req: Request, res: Response) => {
    try {
        const funcionarioRepository = AppDataSource.getRepository(Funcionario);
        // Adicionado relations para você conseguir ver o endereço no EchoApi
       const funcionarios = await funcionarioRepository.find({
    relations: [
                "logradouro",
                "logradouro.bairro",
                "logradouro.bairro.cidade",
                "logradouro.bairro.cidade.estado",
                "logradouro.bairro.cidade.estado.pais"
    ]
        });
        res.status(200).json(funcionarios);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar os funcionários!" });
    }
});

// Visualizar funcionario por ID
router.get("/funcionario/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const funcionarioRepository = AppDataSource.getRepository(Funcionario);
        const funcionario = await funcionarioRepository.findOne({
            where: { id: parseInt(id) },
            relations: ["logradouro",
                        "logradouro.bairro",
                        "logradouro.bairro.cidade",
                        "logradouro.bairro.cidade.estado",
                        "logradouro.bairro.cidade.estado.pais"
            ]
        });

        if (!funcionario) {
            return res.status(404).json({ message: "Funcionário não encontrado!" });
        }
        return res.status(200).json(funcionario);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao visualizar o funcionário!" });
    }
});

// Rota para recuperar somente os funcionarios de uma empresa específica:
router.get("/funcionario/empresa/:empresaId", async (req: Request, res: Response) => {
    try {
        const { empresaId } = req.params;
        const funcionarioRepository = AppDataSource.getRepository(Funcionario);

        const funcionarios = await funcionarioRepository.find({
            where: {
                empresa: { id: parseInt(empresaId) } // Filtra pela relação
            },
            relations: [
                "empresa",
                "logradouro",
                "logradouro.bairro",
                "logradouro.bairro.cidade",
                "logradouro.bairro.cidade.estado",
                "logradouro.bairro.cidade.estado.pais"
            ]
        });

        return res.status(200).json(funcionarios);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar funcionários da empresa." });
    }
});

router.post("/funcionario", async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const funcionarioRepo = AppDataSource.getRepository(Funcionario);

        // 1. Validar CPF
        if (!data.cpf) return res.status(400).json({ message: "CPF é obrigatório!" });
        
        const existingFunc = await funcionarioRepo.findOneBy({ cpf: data.cpf });
        if (existingFunc) return res.status(400).json({ message: "CPF já cadastrado!" });

        // 2. Normalização simples
        // Se vier apenas o ID, o TypeORM já entende. 
        // Se vier o objeto sem ID, precisamos garantir que o logradouro existe.
        if (data.logradouro && !data.logradouro.id) {
            const logradouroRepo = AppDataSource.getRepository(Logradouro);
            const logExistente = await logradouroRepo.findOne({
                where: {
                    nome: data.logradouro.nome,
                    numero: data.logradouro.numero
                }
            });
            if (logExistente) data.logradouro = { id: logExistente.id };
        }

        // 3. Salvar
        const newFuncionario = funcionarioRepo.create(data);
        const salvo = await funcionarioRepo.save(newFuncionario);

        return res.status(201).json({
            message: "Funcionário cadastrado com sucesso!",
            funcionario: salvo
        });
    } catch (error: any) {
        console.error("ERRO DETALHADO:", error);
        return res.status(500).json({ message: "Erro interno", error: error.message });
    }
});

// Rota para editar funcionario:
router.put("/funcionario/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const funcionarioId = parseInt(id);
        const funcionarioRepository = AppDataSource.getRepository(Funcionario);
        const logradouroRepository = AppDataSource.getRepository(Logradouro);

        // 1. Busca a funcionario original
        const funcionario = await funcionarioRepository.findOneBy({ id: funcionarioId });

        if (!funcionario) {
            return res.status(404).json({ message: "Funcionário não encontrado!" });
        }

        // 2. Validação de Duplicidade de CPF
        if (data.cpf) {
            const existingFuncionario = await funcionarioRepository.findOne({
                where: {
                    cpf: data.cpf,
                    id: Not(funcionarioId),
                }
            });

            if (existingFuncionario) {
                return res.status(400).json({ message: "Já existe outro funcionário cadastrado com este CPF!" });
            }
        }

        // 3. Validação de Endereço Existente na Edição
        if (data.logradouro && !data.logradouro.id) {
            const logradouroExistente = await logradouroRepository.findOne({
                where: {
                    nome: data.logradouro.nome,
                    numero: data.logradouro.numero,
                    bairro: { nome: data.logradouro.bairro?.nome }
                }
            });

            if (logradouroExistente) {
                data.logradouro = { id: logradouroExistente.id };
            }
        }

        // 4. O método merge serve para mesclar os novos dados que chegaram na requisição (data)
        // dentro da entidade que você já buscou do banco (funcionario).

        funcionarioRepository.merge(funcionario, data);
        const updatedFuncionario = await funcionarioRepository.save(funcionario);

        return res.status(200).json({
            message: "Funcionário editado com sucesso!",
            funcionario: updatedFuncionario,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao editar a funcionário!" });
    }
});

// Rota para deletar funcionario:
router.delete("/funcionario/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const funcionarioRepository = AppDataSource.getRepository(Funcionario);

        const funcionario = await funcionarioRepository.findOneBy({ id: parseInt(id) });

        if (!funcionario) {
            return res.status(404).json({ message: "Funcionário não encontrado!" });
        }

        await funcionarioRepository.remove(funcionario);

        res.status(200).json({
            message: "Funcionário deletado com sucesso!",
            funcionarioDeleted: funcionario,
        });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao deletar a funcionário!" });
    }
});

export default router;