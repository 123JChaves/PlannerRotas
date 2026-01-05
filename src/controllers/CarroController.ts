import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Carro } from "../models/Carro";
import { Motorista } from "../models/Motorista";

const router = express.Router();

// Rota para visualizar todos os carros:
router.get("/carro", async(req: Request, res: Response) => {
    try {
        const carroRepository = AppDataSource.getRepository(Carro)
        const carros = await carroRepository.find();
        return res.status(200).json({carros});

    } catch (error:any) {
        console.error(error);
        return res.status(500).json({message: "Erro ao listar os carros"});
    }

})

// Rota para a verificação de placa: 

router.get("/carro/verificar/:placa", async (req: Request, res: Response) => {
    const { placa } = req.params;
    const carroRepository = AppDataSource.getRepository(Carro);

    const carro = await carroRepository.findOne({ 
        where: { placa }
    });

    if (carro) {
        return res.json({
            existe: true,
            carro
        });
    }
    return res.json({
        existe: false
    });
});

// Rota para visualizar todos os carros cadastrados, com os motoristas:
router.get("/carro/motoristas", async(req: Request, res: Response) => {
    try {
        const carroRepository = AppDataSource.getRepository(Carro)
        const carros = await carroRepository.find({
            relations: [
                "motoristas",
            ],
        });
        return res.status(200).json({carros});

    } catch (error:any) {
        console.error(error);
        return res.status(500).json({message: "Erro ao listar os carros"});
    }

});

// Rota para visualizar os carros cadastrados por ID:
router.get("/carro/:id", async(req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const carroRepository = AppDataSource.getRepository(Carro);
        const carro = await carroRepository.findOne({
            where: {id: parseInt(id)},
            relations: ["motoristas"]
        });
        if(!carro) {
            return res.status(404).json({message: "Carro não encontrado!"});
        }
        return res.status(200).json({carro});
    } catch (error:any) {
        console.error(error);
        return res.status(500).json({message: "Erro ao visualizar o carro!"})
    }

});

// Rota para cadastrar os carros:
router.post("/carro", async (req: Request, res: Response) => {
    try {
        const { motoristaId, placa, ...carroData } = req.body;
        const carroRepository = AppDataSource.getRepository(Carro);
        const motoristaRepository = AppDataSource.getRepository(Motorista);

        // 1. Busca o motorista que queremos vincular
        const motorista = motoristaId ? await motoristaRepository.findOneBy({ id: Number(motoristaId) }) : null;

        // 2. Tenta encontrar se o carro já existe no banco pela placa
        // Importante carregar as 'relations' para não perder os vínculos de outros motoristas
        let carro = await carroRepository.findOne({
            where: { placa },
            relations: ["motoristas"]
        });

        if (carro) {
            // --- CENÁRIO A: O CARRO JÁ EXISTE (VINCULAR) ---
            if (motorista) {
                // Verifica se o motorista já está na lista desse carro
                const jaVinculado = carro.motoristas?.some(m => m.id === motorista.id);
                
                if (!jaVinculado) {
                    // Adiciona o novo motorista ao array existente (ManyToMany)
                    carro.motoristas = [...(carro.motoristas || []), motorista];
                    await carroRepository.save(carro);
                    return res.status(200).json({ 
                        message: "Veículo já cadastrado! Vinculado ao seu perfil com sucesso.", 
                        carro 
                    });
                } else {
                    return res.status(400).json({ message: "Você já possui este veículo vinculado!" });
                }
            }
        } else {
            // --- CENÁRIO B: O CARRO NÃO EXISTE (CRIAR NOVO) ---
            if (!carroData.cor) {
                return res.status(400).json({ message: "O campo cor é obrigatório para novos cadastros!" });
            }

            const newCarro = new Carro();
            Object.assign(newCarro, { ...carroData, placa });

            if (motorista) {
                newCarro.motoristas = [motorista];
            }

            await carroRepository.save(newCarro);

            return res.status(201).json({
                message: "Carro cadastrado e vinculado com sucesso!",
                carro: newCarro,
            });
        }
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao processar o veículo." });
    }
});

// Rota para editar a cor dos cadastrados:
router.put("/carro/:id", async(req: Request, res: Response) => {
    try {
    const {id} = req.params;
    const {cor} = req.body;
    const carroId = parseInt(id);
    const carroRepository = AppDataSource.getRepository(Carro);
    
    // 1. Busca pelo carro original através do id:
    const carro = await carroRepository.findOne({
        where: {id: carroId}
    });

    if(!carro) {
        console.log(carro);
        return res.status(404).json({
            message: "Carro não encontrado!"
        });
    }

    carro.cor = cor;

    if (!cor) {
    return res.status(400).json({
        message: "O campo cor é obrigatório!"
    });
    }

    const updateCarro = await carroRepository.save(carro);

    return res.status(200).json({
        message: "Cor do carro editada com sucesso!",
        carro: updateCarro
    });
    } catch (error:any) {
        console.error(error)
        return res.status(500).json({
            message: "Erro ao editar a cor do carro!"
        });
    }

});


//Rota para atualização parcial do carro:
router.patch("/carro/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;        
        const carroRepository = AppDataSource.getRepository(Carro);

        const carro = await carroRepository.findOne({
            where: { id: Number(id) },
            relations: ["categorias"],
        });

        if (!carro) {
            return res.status(404).json({ 
                message: "Carro não encontrado!" 
            });
        }

        carroRepository.merge(carro, data);
        await carroRepository.save(carro);

        return res.status(200).json({
            message: "Carro atualizado com sucesso!",
            carroUpdade: carro,
        });

    } catch (error: any) {
        console.error(error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Esta placa já está cadastrada em outro veículo!" });
        }

        return res.status(500).json({ message: "Erro interno ao atualizar o carro." });
    };
});

// Rota para deletar os carros:
router.delete("/carro/:id", async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const carroRepository = AppDataSource.getRepository(Carro);

        const carro = await carroRepository.findOneBy({id: parseInt(id)});

        if(!carro) {
            return res.status(404).json({
                message: "Carro não encontrado!"
            });
        }

        await carroRepository.remove(carro);

        return res.status(200).json({
            message: "Carro deletado com sucesso!",
            carroDelete: carro,
        })

    } catch (error:any) {
        console.error(error);
        return res.status(500).json({
            message: "Erro ao deletar o carro!"
        })
    }

});

export default router;