import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Carro } from "../models/Carro";

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
router.post("/carro", async(req: Request, res: Response) => {
    try {
        const data = req.body;
        const carroRepository = AppDataSource.getRepository(Carro);

        // 1. Verificação no banco da placa para a validação do cadastro do carro
        const existingCarro = await carroRepository.findOne({
            where: { placa: data.placa },
        });

        if (!data.cor) {
        return res.status(400).json({ message: "O campo cor é obrigatório!" });
        }

        if(existingCarro) {
            return res.status(400).json({message: "Já existe um carro cadastrado com a mesma placa!"});
        }
        // 2. O create() prepara para a criação de um objeto 'carro'
        const newCarro = carroRepository.create(data);
        // 3. O save() salva o objeto criado
        await carroRepository.save(newCarro);

        return res.status(201).json({
            message: "Carro cadastrado com sucesso!",
            carro: newCarro,
        });
    } catch (error:any) {
      console.error(error)
      return res.status(500).json({message: "Erro ao cadastrar carro!"})
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