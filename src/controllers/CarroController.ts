import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Carro } from "../models/Carro";

const router = express.Router();

// Rota para visualizar todos os carros cadastrados:
router.get("/carro", async(req: Request, res: Response) => {

});

// Rota para visualizar os carros cadastrados por ID:
router.get("/carro/:id", async(req: Request, res: Response) => {

});

// Rota para cadastrar os carros:
router.post("/carro", async(req: Request, res: Response) => {

});

// Rota para editar os carros cadastrados:
router.put("/carro/:id", async(req: Request, res: Response) => {

});

// Rota para deletar os carros:
router.delete("/carro/:id", async(req: Request, res: Response) => {

});

export default router;