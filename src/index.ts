import 'dotenv/config';
import express, { Request, Response } from "express";
import 'reflect-metadata';
import cors from "cors";

const app = express();

app.use(express.json());

app.use(cors());

import UserController from "./controllers/UserController";
app.use('/', UserController);

import EmpresaController from "./controllers/EmpresaController";
app.use('/', EmpresaController);

import FuncionarioController from "./controllers/FuncionarioController";
app.use('/', FuncionarioController);

import MotoristaController from "./controllers/MotoristaController";
app.use('/', MotoristaController);

import CarroController from "./controllers/CarroController";
app.use('/', CarroController);

import CorridaController from "./controllers/CorridaController";
app.use('/', CorridaController);

import SolicitacaoController from "./controllers/SolicitacaoController";
app.use('/', SolicitacaoController);

import LogradouroController from "./controllers/LogradouroController";
app.use('/', LogradouroController);

import BairroController from "./controllers/BairroController";
app.use('/', BairroController);

import CidadeController from "./controllers/CidadeController";
app.use('/', CidadeController);

import EstadoController from "./controllers/EstadoController";
app.use('/', EstadoController);

import PaisController from "./controllers/PaisController";
app.use('/', PaisController);

import EscalaController from "./controllers/EscalaController";
app.use('/', EscalaController);

import CategoriaController from "./controllers/CategoriaController";
app.use('/', CategoriaController);

app.get("/", (req: Request, res: Response) => {
    res.send("Bem-vindo, Juliano");
});

app.listen(8081, () => {
    console.log("Servidor iniciado na porta 8081: http://localhost:8081")
});