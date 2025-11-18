import express, { Request, Response } from "express";
import 'reflect-metadata';
import { AppDataSource } from "./data-source";

const app = express();

AppDataSource.initialize()
.then(() => {
    console.log("Conexão com o banco de dados realizada com sucesso!");
}).catch((error) => {
    console.log("Erro ao conectar com o banco de dados", error);
})

app.get("/", (req: Request, res: Response) => {
    res.send("Bem-vindo, Juliano!");
})

app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080: http://localhost:8080")
});