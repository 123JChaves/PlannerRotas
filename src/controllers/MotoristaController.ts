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
        relations: ["carros"],
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
            relations: ["carros"],
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

// Rota para editar os motoristas:
router.put("/motorista/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const motoristaId = parseInt(id);
        const motoristaRepository = AppDataSource.getRepository(Motorista);
        const carroRepository = AppDataSource.getRepository(Carro);

        // 1. Busca o Motorista Original
        const motorista = await motoristaRepository.findOne({
            where: { id: motoristaId },
            relations: ["carros"] // Carregamos os carros atuais para o merge funcionar bem
        });

        if (!motorista) {
            return res.status(404).json({ message: "Motorista não encontrado" });
        }

        // 2. Validação de Duplicidade de CPF
        if (data.cpf) {
            const existingMotorista = await motoristaRepository.findOne({
                where: {
                    cpf: data.cpf,
                    id: Not(motoristaId),
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
                // Se o carro enviado não tem ID, verificamos pela placa se ele já existe no sistema
                if (!c.id && c.placa) {
                    const carroExistente = await carroRepository.findOneBy({ placa: c.placa });
                    if (carroExistente) {
                        data.carros[i] = { id: carroExistente.id };
                    }
                }
            }
        }

        // 4. Merge e Save
        // O TypeORM vai atualizar o motorista e, devido ao cascade,
        // gerenciar a lista de carros.
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
        });7
        if(!motorista) {
            return res.status(404).json({message: "Motorista não encontrado"});
        };
        await motoristaRepository.remove(motorista);
        res.status(200).json({
            message: "Motorista deletado com sucesso",
            motoristaDelete: motorista,
        });
    } catch (error) {
        return res.status(500).json({message: "Erro ao deletar motorista!"})    
    }

});

export default router;