import express, { Request, Response } from "express";
import { Not } from "typeorm";
import { AppDataSource } from "../data-source";
import { User } from "../models/User";
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import 'dotenv/config';

const router = express.Router();

//Rota para a listagem de usuário:
router.get("/users", async (req: Request, res: Response) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find();
        
        return res.status(200).json(users);;
        
    } catch (error) {
        return res.status(500).json({
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

// Rota para Autenticação (Login)
router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, senha } = req.body;
        const userRepository = AppDataSource.getRepository(User);

        // 1. Busca o usuário pelo e-mail
        // Importante: Neste modelo, a senha será carregada para comparação
        const user = await userRepository.findOne({ 
            where: {email},
            select: ["id", "nome", "email", "senha"],
         });

        if (!user) {
            return res.status(401).json({
                message: "E-mail ou senha inválidos!"
            });
        }

        // 2. Mesma lógica do Frontend (Segurança em 2025)
        const regexSenha = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;

        if (!regexSenha.test(senha)) {
            return res.status(400).json({
                message: "A senha não atende aos requisitos de segurança (6 caracteres, letra, número e símbolo)."
            });
        }

        // 3. Compara a senha enviada com o Hash salvo no banco
        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
            return res.status(401).json({
                message: "E-mail ou senha inválidos!"
            });
        }

        // 4. Login bem sucedido
        // Em um cenário real, aqui seria gerado um Token JWT
        // Definição de uma chave secreta(Em produção usar process.env.JWT_SECRET)
       const secretKey = process.env.JWT_SECRET!;

        const token = jwt.sign(
            { id: user.id, email: user.email }, // Objeto Payload
            secretKey,                          // Chave Secreta
            { expiresIn: "8h" }                 // Tempo de expiração "8h"
        );

        return res.status(200).json({
            message: "Login realizado com sucesso!",
            token: token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email
            }
        });

    } catch (error:any) {
        console.error(error);
        return res.status(500).json({
            message: "Erro ao processar o login!"
        });
    }

});

//Rota para a edição do usuário:
router.put("/users/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nome, email, senha } = req.body; // Extrai campos específicos
        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOneBy({ id: parseInt(id) });
        if (!user) return res.status(404).json({ message: "Usuário não encontrado!" });

        // 1. Validação de Email Duplicado (Já existente no seu código)
        if (email) {
            const existingUser = await userRepository.findOne({
                where: { email, id: Not(parseInt(id)) }
            });
            if (existingUser) return res.status(400).json({ message: "Email já em uso!" });
            user.email = email;
        }

        // 2. Validação de Senha (se ela for enviada no corpo)
        if (senha) {
            const regexSenha = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
            if (!regexSenha.test(senha)) {
                return res.status(400).json({
                    message: "A nova senha não atende aos requisitos de segurança(min. seis catacteres; uma letra, um número e um caractere especial)!"
                });
            }
            // A senha será hasheada automaticamente pelo @BeforeInsert/@BeforeUpdate da Entity
            user.senha = senha;
        }

        if (nome) user.nome = nome;

        const updatedUser = await userRepository.save(user);

        return res.status(200).json({
            message: "Usuário atualizado com sucesso!",
            user: { id: updatedUser.id, nome: updatedUser.nome, email: updatedUser.email }
        });

    } catch (error) {
        return res.status(500).json({ message: "Erro ao editar!" });
    }
});

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