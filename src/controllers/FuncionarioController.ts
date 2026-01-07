import express, { Request, Response } from "express";
import { Not } from "typeorm";
import { AppDataSource } from "../data-source";
import { Funcionario } from "../models/Funcionario";
import { Logradouro } from "../models/Logradouro";
import { Empresa } from "../models/Empresa";
import { Pessoa } from "../models/Pessoa";

const router = express.Router();

// Listar todos as funcionarios (trazendo o endereço junto)
router.get("/funcionario", async (req: Request, res: Response) => {
    try {
        const funcionarioRepository = AppDataSource.getRepository(Funcionario);

        const funcionarios = await funcionarioRepository.find({
            relations: [
                "pessoa", // ESSENCIAL: Carrega Nome e CPF da tabela Pessoa
                "empresa",
                "logradouro",
                "logradouro.bairro",
                "logradouro.bairro.cidade",
                "logradouro.bairro.cidade.estado",
                "logradouro.bairro.cidade.estado.pais"
            ]
        });

        // Formatação opcional para o JSON ficar mais limpo (achata o objeto pessoa)
        const respostaFormatada = funcionarios.map(f => ({
            id: f.id,
            nome: f.pessoa?.nome,
            cpf: f.pessoa?.cpf,
            empresa: f.empresa?.nome,
            logradouro: f.logradouro,
            createDate: f.createDate
        }));

        res.status(200).json(respostaFormatada);
    } catch (error: any) {
        console.error("Erro ao listar funcionários:", error);
        res.status(500).json({ message: "Erro ao listar os funcionários!", error: error.message });
    }
});

// Visualizar funcionario por ID
router.get("/funcionario/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const funcionarioRepository = AppDataSource.getRepository(Funcionario);
        const funcionario = await funcionarioRepository.findOne({
            where: { id: parseInt(id) },
            relations: [
                        "pessoa",
                        "empresa",
                        "logradouro",
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
                "pessoa",
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

// Rota para cadastrar funcionário no contexto da existência de uma empresa,
// garantindo a existência do funcionário como uma existência somente vinculada
// a uma empresa:
router.post("/empresa/:empresaId/funcionario", async (req: Request, res: Response) => {
    try {
        const { empresaId } = req.params;
        const data = req.body; // Espera-se { nome, cpf, logradouro, ... }

        const funcionarioRepository = AppDataSource.getRepository(Funcionario);
        const empresaRepository = AppDataSource.getRepository(Empresa);
        const pessoaRepository = AppDataSource.getRepository(Pessoa);

        // 1. Verificar Empresa
        const empresa = await empresaRepository.findOneBy({ id: Number(empresaId) });
        if (!empresa) return res.status(404).json({ message: "Empresa não encontrada!" });

        // 2. Validar CPF e gerenciar a Entidade Pessoa
        if (!data.cpf) return res.status(400).json({ message: "CPF é obrigatório!" });

        // Busca se a pessoa já existe no sistema (como motorista ou outro funcionário)
        let pessoa = await pessoaRepository.findOneBy({ cpf: data.cpf });

        if (pessoa) {
            // Se a pessoa existe, verifica se ELA já é funcionária NESTA ou em qualquer empresa
            const funcionarioExistente = await funcionarioRepository.findOneBy({ pessoaId: pessoa.id });
            if (funcionarioExistente) {
                return res.status(400).json({ message: "Este CPF já está vinculado a um funcionário!" });
            }
        } else {
            // Se a pessoa não existe, cria o registro básico dela
            pessoa = pessoaRepository.create({
                nome: data.nome,
                cpf: data.cpf
            });
            await pessoaRepository.save(pessoa);
        }

        // 3. Normalização de Logradouro (mantida sua lógica)
        if (data.logradouro && !data.logradouro.id) {
            const logradouroRepository = AppDataSource.getRepository(Logradouro);
            const logExistente = await logradouroRepository.findOne({
                where: { nome: data.logradouro.nome, numero: data.logradouro.numero }
            });
            if (logExistente) data.logradouro = { id: logExistente.id };
        }

        // 4. Criar o Funcionário vinculado à Pessoa e à Empresa
        const newFuncionario = funcionarioRepository.create({
            pessoa: pessoa, // Vincula a entidade Pessoa (ou pessoaId: pessoa.id)
            empresa: empresa,
            logradouro: data.logradouro,
            // não espalhe ...data aqui para não tentar inserir 'nome' e 'cpf' que não existem mais em Funcionario
        });

        const funcionario = await funcionarioRepository.save(newFuncionario);

        return res.status(201).json({
            message: "Funcionário cadastrado com sucesso!",
            funcionario: funcionario
        });
    } catch (error: any) {
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
        const pessoaRepository = AppDataSource.getRepository(Pessoa);

        // 1. Busca o funcionário incluindo a relação com pessoa
        const funcionario = await funcionarioRepository.findOne({
            where: { id: funcionarioId },
            relations: ["pessoa"] 
        });

        if (!funcionario) {
            return res.status(404).json({ message: "Funcionário não encontrado!" });
        }

        // 2. Validação de Duplicidade de CPF na tabela Pessoa
        if (data.cpf) {
            const existingPessoa = await pessoaRepository.findOne({
                where: {
                    cpf: data.cpf,
                    id: Not(funcionario.pessoa!.id), // Verifica se o CPF pertence a OUTRA pessoa
                }
            });

            if (existingPessoa) {
                return res.status(400).json({ message: "Já existe outra pessoa cadastrada com este CPF!" });
            }
            // Atualiza o CPF no objeto pessoa
            funcionario.pessoa!.cpf = data.cpf;
        }

        // Atualiza o nome se enviado
        if (data.nome) {
            funcionario.pessoa!.nome = data.nome;
        }

        // 3. Validação de Endereço (Logradouro)
        if (data.logradouro && !data.logradouro.id) {
            const logradouroExistente = await logradouroRepository.findOne({
                where: {
                    nome: data.logradouro.nome,
                    numero: data.logradouro.numero
                }
            });

            if (logradouroExistente) {
                data.logradouro = { id: logradouroExistente.id };
            }
        }

        // 4. Merge e Save
        // Removemos nome e cpf de 'data' antes do merge para não dar erro, 
        // pois eles não existem mais em Funcionario
        const { nome, cpf, ...funcionarioData } = data;
        
        funcionarioRepository.merge(funcionario, funcionarioData);
        
        // O save salvará tanto o funcionário quanto as alterações em funcionario.pessoa (devido ao cascade)
        const updatedFuncionario = await funcionarioRepository.save(funcionario);

        return res.status(200).json({
            message: "Funcionário editado com sucesso!",
            funcionario: updatedFuncionario,
        });

    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao editar funcionário", error: error.message });
    }
});

// Rota para deletar funcionario:
router.delete("/funcionario/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const funcionarioRepository = AppDataSource.getRepository(Funcionario);

        // Busca o funcionário (sem necessidade de carregar a pessoa aqui)
        const funcionario = await funcionarioRepository.findOneBy({ id: parseInt(id) });

        if (!funcionario) {
            return res.status(404).json({ message: "Funcionário não encontrado!" });
        }

        // Isso remove apenas a linha na tabela 'funcionario'
        // A tabela 'pessoa' permanece intacta
        await funcionarioRepository.remove(funcionario);

        return res.status(200).json({
            message: "Funcionário removido com sucesso! Os dados básicos da pessoa foram preservados.",
            funcionarioDeleted: funcionario,
        });
    } catch (error: any) {
        return res.status(500).json({ message: "Erro ao deletar funcionário", error: error.message });
    }
});

export default router;