import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Logradouro } from "../models/Logradouro";
import { Bairro } from "../models/Bairro";

const router = express.Router();
// Rota para visualizar uma lista de endereços:
router.get("/logradouro", async (req: Request, res: Response) => {
    try {
        const logradouroRepository = AppDataSource.getRepository(Logradouro);
        const logradouros = await logradouroRepository.find({
            // Carrega o bairro para saber onde fica o logradouro
            relations: [
                "bairro",
                "bairro.cidade",
                "bairro.cidade.estado",
                "bairro.cidade.estado.pais"
            ]
        });

        return res.status(200).json(logradouros);
    } catch (error: any) {
        return res.status(500).json({ message: "Erro ao listar endereços: " + error.message });
    }
});

// Rota para visualizar um endereço por id:
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

// Rota de cadastro de Logradouro:
router.post("/logradouro", async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const { nome, numero, bairro, latitude, longitude } = data;
        const logradouroRepository = AppDataSource.getRepository(Logradouro);
        const bairroRepository = AppDataSource.getRepository(Bairro);

        // 1. Validação básica
        if (!nome || !numero || !bairro) {
            return res.status(400).json({ message: "Nome, número e dados do bairro são obrigatórios." });
        }

        let bairroFinal;

        // 2. Lógica "Buscar ou Criar" para o Bairro
        // Se não enviou ID, mas enviou o NOME, tentamos achar o bairro no banco
        if (bairro && !bairro.id && bairro.nome) {
            const bairroExistente = await bairroRepository.findOne({
                where: {
                    nome: bairro.nome,
                    cidade: bairro.cidade?.id ? { id: bairro.cidade.id } : { nome: bairro.cidade?.nome }
                }
            });

            if (bairroExistente) {
                // Se o bairro já existe, usamos o ID dele
                bairroFinal = { id: bairroExistente.id };
            } else {
                // Se não existe, o objeto enviado será usado para criar um novo via cascade
                bairroFinal = bairro;
            }
        } else {
            // Se já enviou ID, usa o ID direto
            bairroFinal = bairro;
        }

        // 3. Verificação de duplicidade do Logradouro (Rua + Número + Bairro)
        // Usamos a referência resolvida (ID ou Nome) para checar se o endereço físico já existe
        const logradouroExistente = await logradouroRepository.findOne({
            where: {
                nome: nome,
                numero: numero,
                bairro: bairroFinal.id ? { id: bairroFinal.id } : { nome: bairro.nome }
            }
        });

        if (logradouroExistente) {
            return res.status(400).json({
                message: "Este endereço já consta na base de dados.",
                dados: logradouroExistente
            });
        }

        // 4. Criação e Salvamento
        const logradouro = logradouroRepository.create({
            nome,
            numero,
            latitude,
            longitude,
            bairro: bairroFinal
        });

        await logradouroRepository.save(logradouro);

        return res.status(201).json({
            message: "Logradouro processado com sucesso!",
            novoLogradouro: logradouro
        });

    } catch (error: any) {
        console.error(error);
        // Trata erro de duplicidade caso a transação falhe na constraint do banco
        if (error.message.includes("Duplicate entry")) {
            return res.status(400).json({ message: "Erro: Este logradouro ou um elemento da hierarquia já existe." });
        }
        return res.status(500).json({ message: "Erro ao salvar: " + error.message });
    }
});

// Rota de edição de logradouro:
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
        logradouroRepository.merge(logradouro, req.body);

        await logradouroRepository.save(logradouro);

        return res.status(200).json({
            message: "Coordenadas atualizadas com sucesso!",
            logradouro
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
});

router.delete("/logradouro/:id", async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const logradouroRepository = AppDataSource.getRepository(Logradouro);
        const logradouro = await logradouroRepository.findOne({
            where: {id: Number(id)}
        });
        
        if(!logradouro) {
            return res.status(404).json({
                message: "Logradouro não encontrado!"
            });
        }

        await logradouroRepository.remove(logradouro);

        return res.status(200).json({
            message: "Logradouro removido com sucesso!",
            logradouroDelete: logradouro
        });

    } catch (error:any) {
        console.error(error);

         // Tratamento para erro de chave estrangeira (se o logradouro estiver em uso)
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.message.includes("foreign key constraint")) {
            return res.status(400).json({
                message: "Não é possível excluir: este logradouro está vinculado a funcionários, empresas ou corridas."
            });
        }
        
        res.status(500).json({
            message: "Erro ao deletar o Logradouro"
        });
    }
});

export default router;