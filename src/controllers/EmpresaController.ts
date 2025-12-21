import express, { Request, Response} from "express";
import { Not } from "typeorm";
import { AppDataSource } from "../data-source";
import { Empresa } from "../models/Empresa";
import { Logradouro } from "../models/Logradouro";

const router = express.Router();

// Listar todas as empresas (trazendo o endereço junto)
router.get("/empresa", async (req: Request, res: Response) => {
    try {
        const empresaRepository = AppDataSource.getRepository(Empresa);
        // Adicionado relations para você conseguir ver o endereço no Postman
       const empresas = await empresaRepository.find({
    relations: [
                "logradouro",
                "logradouro.bairro",
                "logradouro.bairro.cidade",
                "logradouro.bairro.cidade.estado",
                "logradouro.bairro.cidade.estado.pais"
    ]
        });
        res.status(200).json(empresas);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar as empresas!" });
    }
});

// Visualizar empresa por ID
router.get("/empresa/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const empresaRepository = AppDataSource.getRepository(Empresa);
        const empresa = await empresaRepository.findOne({
            where: { id: parseInt(id) },
            relations: ["logradouro",
                        "logradouro.bairro",
                        "logradouro.bairro.cidade",
                        "logradouro.bairro.cidade.estado",
                        "logradouro.bairro.cidade.estado.pais"
            ]
        });

        if (!empresa) {
            return res.status(404).json({ message: "Empresa não encontrada!" });
        }
        return res.status(200).json(empresa);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao visualizar a empresa!" });
    }
});

// Rota para listar funcionários de uma empresa específica
router.get("/empresa/:id/funcionario", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const empresaRepository = AppDataSource.getRepository(Empresa);

        // Buscamos a empresa e trazemos a lista de funcionários vinculada
        const empresaComFuncionarios = await empresaRepository.findOne({
            where: { id: parseInt(id) },
            relations: [
                "funcionarios", // Traz a lista de funcionários
                "funcionarios.logradouro", // Traz o endereço do funcionário
                "funcionarios.logradouro.bairro", //Traz o bairro do funcionário
                "funcionarios.logradouro.bairro.cidade", //Traz a cidade do funcionário
                "funcionarios.logradouro.bairro.cidade.estado", //Traz o estado do funcionário
                "funcionarios.logradouro.bairro.cidade.estado.pais" //Traz o país do funcionário
            ]
        });

        if (!empresaComFuncionarios) {
            return res.status(404).json({ message: "Empresa não encontrada!" });
        }

        // Retornamos apenas a lista de funcionários daquela empresa
        return res.status(200).json(empresaComFuncionarios.funcionarios);

    } catch (error: any) {
        console.error("Erro ao listar funcionários da empresa:", error);
        return res.status(500).json({ message: "Erro ao listar os funcionários da empresa!" });
    }
});

// Cadastro de empresa (Com suporte a Cascade)
router.post("/empresa", async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const empresaRepository = AppDataSource.getRepository(Empresa);
        const logradouroRepository = AppDataSource.getRepository(Logradouro);

        // 1. Validar CNPJ
        const existingEmpresa = await empresaRepository.findOne({
            where: { cnpj: data.cnpj },
        });

        if (existingEmpresa) {
            return res.status(400).json({ message: "Já existe uma empresa com esse cnpj!" });
        }

        // 2. Lógica "Buscar ou Criar" para o Logradouro
        if (data.logradouro && !data.logradouro.id) {
            const logradouroExistente = await logradouroRepository.findOne({
                where: {
                    nome: data.logradouro.nome,
                    numero: data.logradouro.numero,
                    bairro: { nome: data.logradouro.bairro?.nome }
                }
            });

            if (logradouroExistente) {
                // Se o endereço já existe, usamos o ID dele em vez de criar um novo
                data.logradouro = { id: logradouroExistente.id };
            }
        }

        // 3. O .create() prepara o objeto para o Cascade
        const newEmpresa = empresaRepository.create(data);
        await empresaRepository.save(newEmpresa);

        return res.status(201).json({
            message: "Empresa Cadastrada com Sucesso!",
            empresa: newEmpresa,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao cadastrar a empresa!" });
    }
});

// Rota para editar empresa:
router.put("/empresa/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const empresaId = parseInt(id);
        const empresaRepository = AppDataSource.getRepository(Empresa);
        const logradouroRepository = AppDataSource.getRepository(Logradouro);

        // 1. Busca a empresa original
        const empresa = await empresaRepository.findOneBy({ id: empresaId });

        if (!empresa) {
            return res.status(404).json({ message: "Empresa não encontrada!" });
        }

        // 2. Validação de Duplicidade de CNPJ
        if (data.cnpj) {
            const existingEmpresa = await empresaRepository.findOne({
                where: {
                    cnpj: data.cnpj,
                    id: Not(empresaId),
                }
            });

            if (existingEmpresa) {
                return res.status(400).json({ message: "Já existe outra empresa cadastrada com este CNPJ!" });
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
        // dentro da entidade que você já buscou do banco (empresa).

        empresaRepository.merge(empresa, data);
        const updatedEmpresa = await empresaRepository.save(empresa);

        return res.status(200).json({
            message: "Empresa editada com sucesso!",
            empresa: updatedEmpresa,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao editar a empresa!" });
    }
});

// Rota para deletar empresa:
router.delete("/empresa/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const empresaRepository = AppDataSource.getRepository(Empresa);

        const empresa = await empresaRepository.findOneBy({ id: parseInt(id) });

        if (!empresa) {
            return res.status(404).json({ message: "Empresa não encontrada!" });
        }

        await empresaRepository.remove(empresa);

        res.status(200).json({
            message: "Empresa deletada com sucesso!",
            empresaDeleted: empresa,
        });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao deletar a empresa!" });
    }
});

export default router;
