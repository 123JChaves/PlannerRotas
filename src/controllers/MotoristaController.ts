import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Motorista } from "../models/Motorista";
import { Carro } from "../models/Carro";
import { Not } from "typeorm";

const router = express.Router();

// Rota para visualizar todos os motoristas cadastrados:
router.get("/motorista", async(req: Request, res: Response) => {
    try {
       const motoristaRepository = AppDataSource.getRepository(Motorista);
       
       const motoristas = await motoristaRepository.find({
        relations: ["carroAtual","carros"],
       });

       res.status(200).json(motoristas);
       
    } catch (error) {
        res.status(500).json({message: "Erro ao listar os motoristas!"});
    }

});

// Rota para visualizar os motoristas cadastrados por ID:
router.get("/motorista/:id", async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const motoristaRepository = AppDataSource.getRepository(Motorista);
        const motorista = await motoristaRepository.findOne({
            where: {id: parseInt(id)},
            relations: ["carroAtual","carros"],
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
router.post("/motorista", async(req: Request, res: Response) => {
    try {
       const data = req.body;
       const motoristaRepository = AppDataSource.getRepository(Motorista);
       
       //Validar cpf(ainda de forma incompleta):
       if(!data.cpf) {
        
            return res.status(400).json({message: "CPF é obrigatório!"});
       
        }

       const existingMotorista = await motoristaRepository.findOneBy({cpf: data.cpf});

       if(existingMotorista) {
            
            return res.status(400).json({message: "Já existe um motorista com esse CPF!"});

       }

       const newMotorista = motoristaRepository.create(data);

       await motoristaRepository.save(newMotorista);

       return res.status(201).json({
            message: "Motorista Cadastrado com Sucesso!",
            motorista: newMotorista
       });

    } catch (error:any) {
            console.error("Erro ao cadastrar o motorista", error);
            return res.status(500).json({message: "Erro interno ao cadastrar o motorita", error: error.message});
    }
});

// Rota para definir o carro atual para o motorista:
router.patch("/motorista/:id/definir-carro", async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // ID do Motorista
        const { carroId } = req.body; // ID do Carro selecionado

        const motoristaRepo = AppDataSource.getRepository(Motorista);

        // 1. Atualiza apenas o campo carroAtualId
        await motoristaRepo.update(id, { 
            carroAtualId: carroId 
        });

        return res.status(200).json({ message: "Veículo atualizado com sucesso!" });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao definir veículo atual" });
    }
});

// Rota para criar um vínculo com um carro já existente:
router.patch("/motorista/:id/vincular-frota", async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // ID do Motorista
        const { carroId } = req.body; // ID do Carro já existente no sistema

        const motoristaRepository = AppDataSource.getRepository(Motorista);
        const carroRepository = AppDataSource.getRepository(Carro);

        // 1. Busca o motorista carregando a frota atual (necessário para ManyToMany)
        const motorista = await motoristaRepository.findOne({
            where: { id: Number(id) },
            relations: ["carros"]
        });

        if (!motorista) return res.status(404).json({ message: "Motorista não encontrado" });

        // 2. Busca o carro que será adicionado
        const carro = await carroRepository.findOne({ where: { id: Number(carroId) } });
        if (!carro) return res.status(404).json({ message: "Carro não encontrado" });

        // 3. Adiciona o novo carro ao array existente
        // O TypeORM identifica que é uma relação ManyToMany e atualiza a tabela intermediária
        motorista.carros = [...(motorista.carros || []), carro];

        await motoristaRepository.save(motorista);

        return res.status(200).json({ message: "Carro adicionado à frota com sucesso!" });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao atualizar frota do motorista" });
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

        // 1. Busca o Motorista Original (Adicionado 'carroAtual' nas relations)
        const motorista = await motoristaRepository.findOne({
            where: { id: motoristaId },
            relations: ["carros", "carroAtual"] 
        });

        if (!motorista) {
            return res.status(404).json({ message: "Motorista não encontrado" });
        }

        // 2. Validação de Duplicidade de CPF
        if (data.cpf) {
            const existingMotorista = await motoristaRepository.findOne({
                where: {
                    cpf: data.cpf,
                    id: Not(motoristaId), // Garante que não é o próprio motorista
                }
            });
            if (existingMotorista) {
                return res.status(400).json({ 
                    message: "Já existe outro motorista cadastrado com este CPF!" 
                });
            }
        }

        // 3. Validação de Carros (Tratando como Array conforme a Entidade)
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
        // O merge processa 'nome', 'cpf', 'carros' e 'carroAtual'
        motoristaRepository.merge(motorista, data);
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
router.delete("/motorista/:id", async(req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const motoristaRepository = AppDataSource.getRepository(Motorista);

        const motorista = await motoristaRepository.findOne({
            where: {id: parseInt(id)},
        });
        if(!motorista) {
            return res.status(404).json({message: "Motorista não encontrado"});
        };
        await motoristaRepository.remove(motorista);
        res.status(200).json({
            message: "Motorista deletado com sucesso",
            motoristaDelete: motorista,
        });
    } catch (error) {
        return res.status(500).json({message: "Erro ao deletar motorista!"});
    }

});

// Rota para destruir o vínculo com um carro específico:
router.delete("/motorista/:id/desvincular-frota/:carroId", async (req: Request, res: Response) => {
    try {
        const { id, carroId } = req.params;

        const motoristaRepo = AppDataSource.getRepository(Motorista);

        // 1. Busca o motorista com a frota carregada
        const motorista = await motoristaRepo.findOne({
            where: { id: Number(id) },
            relations: ["carros"]
        });

        if (!motorista) return res.status(404).json({ message: "Motorista não encontrado" });

        // 2. Filtra o array para REMOVER o carro específico
        motorista.carros = motorista.carros?.filter(c => c.id !== Number(carroId));

        // 3. Regra de Negócio: Se o carro removido da frota for o que ele está usando agora, limpa o uso
        if (motorista.carroAtualId === Number(carroId)) {
            motorista.carroAtualId = null;
        }

        await motoristaRepo.save(motorista);

        return res.status(200).json({ message: "Vínculo removido com sucesso!" });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao destruir vínculo" });
    }
});

export default router;