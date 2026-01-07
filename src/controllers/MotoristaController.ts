import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Motorista } from "../models/Motorista";
import { Carro } from "../models/Carro";
import { Not } from "typeorm";
import { Pessoa } from "../models/Pessoa";

const router = express.Router();

// Rota para visualizar todos os motoristas cadastrados:
router.get("/motorista", async (req: Request, res: Response) => {
    try {
        const motoristaRepository = AppDataSource.getRepository(Motorista);
        
        const motoristas = await motoristaRepository.find({
            relations: [
                "pessoa",      // ESSENCIAL: Recupera Nome e CPF
                "carroAtual", 
                "carros"
            ],
        });

        // Formatação opcional para simplificar a resposta (achata os dados da pessoa)
        const respostaFormatada = motoristas.map(m => ({
            id: m.id,
            nome: m.pessoa?.nome,
            cpf: m.pessoa?.cpf,
            carroAtual: m.carroAtual,
            frota: m.carros,
            createDate: m.createDate
        }));

        return res.status(200).json(respostaFormatada);
       
    } catch (error: any) {
        console.error("Erro ao listar motoristas:", error);
        return res.status(500).json({ 
            message: "Erro ao listar os motoristas!",
            error: error.message 
        });
    }
});

// Rota para visualizar os motoristas cadastrados por ID:
router.get("/motorista/:id", async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const motoristaRepository = AppDataSource.getRepository(Motorista);
        const motorista = await motoristaRepository.findOne({
            where: {id: parseInt(id)},
            relations: ["carroAtual","carros", "pessoa"],
        });

        if(!motorista) {
            return res.status(404).json({message: "Motorista não encontrado"});
        }

        return res.status(200).json(motorista);

    } catch (error:any) {
        return res.status(500).json({message: "Erro ao visualizar motorista"});
    }

});

// Rota para cadastrar os motoristas:
router.post("/motorista", async (req: Request, res: Response) => {
    try {
        const data = req.body; // { nome, cpf, carros, carroAtualId... }
        const motoristaRepository = AppDataSource.getRepository(Motorista);
        const pessoaRepository = AppDataSource.getRepository(Pessoa);

        // 1. Validar CPF
        if (!data.cpf) {
            return res.status(400).json({ message: "CPF é obrigatório!" });
        }

        // 2. Gerenciar a Entidade Pessoa (Especialização)
        let pessoa = await pessoaRepository.findOneBy({ cpf: data.cpf });

        if (pessoa) {
            // Se a pessoa existe, verifica se ela já é motorista
            const motoristaExistente = await motoristaRepository.findOneBy({ pessoaId: pessoa.id });
            if (motoristaExistente) {
                return res.status(400).json({ message: "Já existe um motorista cadastrado com esse CPF!" });
            }
            
            // Opcional: Atualizar o nome da pessoa se ele vier diferente no body
            if (data.nome && data.nome !== pessoa.nome) {
                pessoa.nome = data.nome;
                await pessoaRepository.save(pessoa);
            }
        } else {
            // Se a pessoa não existe, cria o registro básico
            pessoa = pessoaRepository.create({
                nome: data.nome,
                cpf: data.cpf
            });
            await pessoaRepository.save(pessoa);
        }

        // 3. Criar o Motorista vinculado à Pessoa
        // Removemos nome e cpf de 'data' para evitar erros no TypeORM
        const { nome, cpf, ...motoristaData } = data;

        const newMotorista = motoristaRepository.create({
            ...motoristaData,
            pessoa: pessoa // Vincula a entidade Pessoa encontrada ou criada
        });

        await motoristaRepository.save(newMotorista);

        return res.status(201).json({
            message: "Motorista Cadastrado com Sucesso!",
            motorista: newMotorista
        });

    } catch (error: any) {
        console.error("Erro ao cadastrar o motorista", error);
        return res.status(500).json({ 
            message: "Erro interno ao cadastrar o motorista", 
            error: error.message 
        });
    }
});

// Rota para definir o carro atual para o motorista:
router.patch("/motorista/:id/definir-carro", async (req: Request, res: Response) => {
    try {
        const { id } = req.params; 
        const { carroId } = req.body; 

        const motoristaRepo = AppDataSource.getRepository(Motorista);

        // 1. Verificar se o motorista existe (Opcional, mas recomendado em 2026)
        const motorista = await motoristaRepo.findOneBy({ id: parseInt(id) });
        if (!motorista) {
            return res.status(404).json({ message: "Motorista não encontrado!" });
        }

        // 2. Atualiza apenas o campo carroAtualId
        // O método update é eficiente pois não carrega a entidade inteira na memória
        await motoristaRepo.update(id, { 
            carroAtualId: carroId 
        });

        return res.status(200).json({ 
            message: "Veículo atualizado com sucesso!",
            motoristaId: id,
            carroId: carroId
        });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ 
            message: "Erro ao definir veículo atual", 
            error: error.message 
        });
    }
});

// Rota para criar um vínculo com um carro já existente:
router.patch("/motorista/:id/vincular-frota", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { carroId } = req.body;

        const motoristaRepository = AppDataSource.getRepository(Motorista);
        const carroRepository = AppDataSource.getRepository(Carro);

        // 1. Busca o motorista carregando a relação ManyToMany 'carros'
        // Nota: Não precisamos carregar 'pessoa' aqui, a menos que queiramos retornar o nome no JSON
        const motorista = await motoristaRepository.findOne({
            where: { id: Number(id) },
            relations: ["carros"]
        });

        if (!motorista) {
            return res.status(404).json({ message: "Motorista não encontrado" });
        }

        // 2. Busca o carro
        const carro = await carroRepository.findOne({ where: { id: Number(carroId) } });
        if (!carro) {
            return res.status(404).json({ message: "Carro não encontrado" });
        }

        // 3. Evitar duplicidade no array (Regra de Negócio)
        const jaPossuiCarro = motorista.carros?.some(c => c.id === carro.id);
        if (jaPossuiCarro) {
            return res.status(400).json({ message: "Este carro já está vinculado à frota deste motorista!" });
        }

        // 4. Adiciona o novo carro ao array existente
        // Usamos o operador spread para manter a imutabilidade antes do save
        motorista.carros = [...(motorista.carros || []), carro];

        await motoristaRepository.save(motorista);

        return res.status(200).json({ 
            message: "Carro adicionado à frota com sucesso!",
            totalCarros: motorista.carros.length 
        });

    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ 
            message: "Erro ao atualizar frota do motorista", 
            error: error.message 
        });
    }
});

// Rota para editar os motoristas:
router.put("/motorista/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const motoristaId = parseInt(id);
        
        const motoristaRepository = AppDataSource.getRepository(Motorista);
        const carroRepository = AppDataSource.getRepository(Carro);
        const pessoaRepository = AppDataSource.getRepository(Pessoa);

        // 1. Busca o Motorista incluindo a relação com Pessoa e Carros
        const motorista = await motoristaRepository.findOne({
            where: { id: motoristaId },
            relations: ["pessoa", "carros", "carroAtual"] 
        });

        if (!motorista || !motorista.pessoa) {
            return res.status(404).json({ message: "Motorista ou dados pessoais não encontrados" });
        }

        // 2. Validação de Duplicidade de CPF na tabela Pessoa
        if (data.cpf) {
            const existingPessoa = await pessoaRepository.findOne({
                where: {
                    cpf: data.cpf,
                    id: Not(motorista.pessoa.id), // Verifica se o CPF pertence a OUTRA pessoa
                }
            });
            if (existingPessoa) {
                return res.status(400).json({ 
                    message: "Já existe outra pessoa cadastrada com este CPF!" 
                });
            }
            // Atualiza o CPF e Nome no objeto pessoa vinculado
            motorista.pessoa.cpf = data.cpf;
        }
        
        if (data.nome) {
            motorista.pessoa.nome = data.nome;
        }

        // 3. Validação de Carros (Normalização por Placa)
        if (data.carros && Array.isArray(data.carros)) {
            for (let i = 0; i < data.carros.length; i++) {
                const c = data.carros[i];
                if (!c.id && c.placa) {
                    const carroExistente = await carroRepository.findOneBy({ placa: c.placa });
                    if (carroExistente) {
                        data.carros[i] = { id: carroExistente.id };
                    }
                }
            }
        }

        // 4. Merge e Save
        // Removemos campos de Pessoa do 'data' para o merge não falhar
        const { nome, cpf, ...motoristaData } = data;
        
        motoristaRepository.merge(motorista, motoristaData);

        // O save atualizará a tabela 'motorista' e a tabela 'pessoa' via cascade
        const updateMotorista = await motoristaRepository.save(motorista);

        return res.status(200).json({
            message: "Motorista editado com sucesso",
            motorista: updateMotorista,
        });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao editar o motorista", error: error.message });
    }
});

// Rota para deletar os motoristas:
router.delete("/motorista/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const motoristaRepo = AppDataSource.getRepository(Motorista);

        // 1. IMPORTANTE: Carregue a pessoa para que o TypeORM saiba que deve deletá-la
        const motorista = await motoristaRepo.findOne({
            where: { id: parseInt(id) },
            relations: ["pessoa"]
        });

        if (!motorista) return res.status(404).json({ message: "Não encontrado" });

        // 2. Antes de deletar, registrar o log em uma tabela de auditoria se desejar
        // console.log(`Arquivando histórico de: ${motorista.pessoa.nome}`);

        // 3. Ao remover o motorista, o cascade: true removerá a Pessoa e o Funcionario (se houver)
        // dependendo de como suas FKs estão no banco.
        await motoristaRepo.remove(motorista);

        return res.status(200).json({ message: "Dados removidos. Histórico de corridas preservado (como anônimo/nulo)." });
    } catch (error: any) {
        return res.status(500).json({ message: "Erro ao deletar", error: error.message });
    }
});

// Rota para destruir o vínculo com um carro específico:
router.delete("/motorista/:id/desvincular-frota/:carroId", async (req: Request, res: Response) => {
    try {
        const { id, carroId } = req.params;
        const motoristaId = Number(id);
        const targetCarroId = Number(carroId);

        const motoristaRepo = AppDataSource.getRepository(Motorista);

        // 1. Busca o motorista com a relação 'carros'
        // Nota: Não é necessário carregar 'pessoa' aqui, economizando recursos.
        const motorista = await motoristaRepo.findOne({
            where: { id: motoristaId },
            relations: ["carros"]
        });

        if (!motorista) {
            return res.status(404).json({ message: "Motorista não encontrado" });
        }

        // 2. Verifica se o carro realmente pertence à frota antes de tentar remover
        const possuiCarro = motorista.carros?.some(c => c.id === targetCarroId);
        if (!possuiCarro) {
            return res.status(404).json({ message: "Este carro não faz parte da frota deste motorista" });
        }

        // 3. Filtra o array para REMOVER o carro específico
        motorista.carros = motorista.carros?.filter(c => c.id !== targetCarroId);

        // 4. Regra de Negócio: Se o carro removido for o atual, limpa o carroAtualId e a relação carroAtual
        if (motorista.carroAtualId === targetCarroId) {
            motorista.carroAtualId = null;
            motorista.carroAtual = null; // Garante que a relação carregada em memória também seja limpa
        }

        // 5. Salva as alterações na tabela intermediária (motorista_carros) e na tabela motorista
        await motoristaRepo.save(motorista);

        return res.status(200).json({ 
            message: "Vínculo removido com sucesso!",
            carroRemovidoId: targetCarroId
        });

    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ 
            message: "Erro ao desvincular veículo", 
            error: error.message 
        });
    }
});

export default router;