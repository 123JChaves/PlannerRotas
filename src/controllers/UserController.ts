import express, { Request, Response } from "express";
import { Not } from "typeorm";
import { AppDataSource } from "../data-source";
import { User } from "../models/User";

const router = express.Router();

//Rota para a listagem de usuário:

router.get("/users", async (req: Request, res: Response) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
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
        const userRepository = AppDataSource.getRepository(User);
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

//Rota para cadastro de usuário:

router.post("/users", async (req: Request, res: Response) => {
    try {
        var data = req.body;

        const userRepository = AppDataSource.getRepository(User);

        const existingUser = await userRepository.findOne({
        where: { email: data.email },
        
        });

    if (existingUser) {
        return res.status(400).json({
        message: "Já existe um usuário cadastrado com esse email!",
        });
    }

    const newUser = userRepository.create(data);

    await userRepository.save(newUser);

    res.status(201).json({
        message: "Usuário Cadastrado com Sucesso!",
        user: newUser,
        });
    } catch (error) {
    return res.status(500).json({
        message: "Erro ao cadastrar usuário!",
    });
    }
});

//Rota para a edição do usuário:

router.put("/users/:id", async (req: Request, res: Response) => {

    try {

        const {id} = req.params;

        const data = req.body;

        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOneBy({id: parseInt(id)});

        if(!user) {
            return res.status(404).json({
                message: "Usuário não encontrado!"
            });
        }

        const existingUser = await userRepository.findOne({
            where: {
                email: data.email,
                id: Not(parseInt(id)),
            }
        });

        if(existingUser) {
            return res.status(400).json({
                message: "Já existe um usuário cadastrado com esse email!"
            });
        }

        userRepository.merge(user, data);

        const updatedUser = await userRepository.save(user);

        res.status(200).json({
        message: "Usuário editado com sucesso!",
        user: updatedUser,
            });

    } catch (error) {
            return res.status(500).json({
            message: "Erro ao editar o usuário!"
            });
        }

} )

//Rota para a deletar o usuário:

router.delete("/users/:id", async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOneBy({id: parseInt(id)});

        if(!user) {
            return res.status(404).json({
                message: "Usuário não encontrado!"
            });
        }

        await userRepository.remove(user);

        return res.status(200).json({
            message: "Usuário deletado com sucesso!",
            userDelet: user,
        });

    } catch (error) {
            return res.status(500).json({
            message: "Erro ao deletar o usuário!"
            });
        }

});

export default router;