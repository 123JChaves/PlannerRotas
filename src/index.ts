import express, { Request, Response } from "express";
import 'reflect-metadata';
import cors from "cors";

const app = express();

app.use(express.json());

app.use(cors());

import UserController from "./controllers/UserController";

app.use('/', UserController);

app.get("/", (req: Request, res: Response) => {
    res.send("Bem-vindo, Juliano");
});

app.listen(8081, () => {
    console.log("Servidor iniciado na porta 8081: http://localhost:8081")
});