import express, { Request, Response, Router } from "express";
import { Not } from "typeorm";
import { AppDataSource } from "../data-source";
import { Empresa } from "../models/Empresa";

const router = express.Router();

router.get("/empresa", async (req: Request, res: Response) => {
    try {
        const userRepository = AppDataSource.getRepository(Empresa);
        const users = await userRepository.find();
        res.status(200).json(users);

        return;
        
    } catch (error) {
        res.status(500).json({
        message: "Erro ao listar os usuários!"
        });
    }
});

//Rota para visualização do usuário usando ID:

router.get("/users/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userRepository = AppDataSource.getRepository(Empresa);
        const user = await userRepository.findOneBy({ id: parseInt(id) });

        if (!user) {
            return res.status(404).json({
            message: "Usuário não encontrado!"
            });
        }

        return res.status(200).json({ user });

        } catch (error) {
            return res.status(500).json({
            message: "Erro ao visualizar o usuário!"
            });
        }
});

export default router;