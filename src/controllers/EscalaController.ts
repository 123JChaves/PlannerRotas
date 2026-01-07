
import express, { Request, Response } from "express"; 
import { AppDataSource } from "../data-source";
import { Escala } from "../models/Escala";
import { EscalaMotorista } from "../models/EscalaMotorista";

const router = express.Router()

router.get("/escalas", async (req: Request, res: Response) => {
    try {
        const { data } = req.query;
        const repo = AppDataSource.getRepository(Escala);

        // Definição das relações que precisam ser carregadas
        const includes = {
            motoristasOrdem: {
                motorista: {
                    pessoa: true,
                    carroAtual: true // Carrega o carro para pegar a placa
                }
            }
        };

        if (data) {
            const escala = await repo.findOne({ 
                where: { data: String(data) },
                relations: includes // Adicionado aqui
            });
            if (!escala) return res.status(404).json({ message: "Escala não encontrada." });
            return res.json(escala);
        }

        const escalas = await repo.find({ 
            order: { data: "DESC" },
            relations: includes // Adicionado aqui
        });
        
        return res.json(escalas);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao buscar escalas." });
    }
});

//Rota para criar escalas de motoristas:
router.post("/escalas/gerar-dia", async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
        const { dataBr, motoristaIds, tipoRota } = req.body; // Ex: "07/01/2026", [1, 5, 3], "IDA"

        // 1. Tratamento de Data
        const [dia, mes, ano] = dataBr.split('/');
        const dataFormatada = `${ano}-${mes}-${dia}`;
        const rota = tipoRota || "IDA";

        await queryRunner.connect();
        await queryRunner.startTransaction();

        const repoEscala = queryRunner.manager.getRepository(Escala);

        // 2. Limpeza de escala existente (Evita duplicidade para o mesmo dia e turno)
        // O TypeORM removerá em cascata os registros de EscalaMotorista associados
        await repoEscala.delete({ data: dataFormatada, tipoRota: rota });

        // 3. Criação da nova Escala
        const novaEscala = repoEscala.create({
            data: dataFormatada,
            tipoRota: rota
        });

        // 4. Mapeamento da Fila de Motoristas (Relacional)
        // Transformamos o array de números na entidade intermediária com a ordem
        if (motoristaIds && Array.isArray(motoristaIds)) {
            novaEscala.motoristasOrdem = motoristaIds.map((id: number, index: number) => {
                const itemFila = new EscalaMotorista();
                itemFila.ordem = index; // Preserva a ordem exata da seleção manual
                itemFila.motorista = { id } as any; // Atribui apenas o ID para o vínculo
                itemFila.escala = novaEscala;
                return itemFila;
            });
        }

        const escalaSalva = await repoEscala.save(novaEscala);

        await queryRunner.commitTransaction();

        return res.status(201).json({ 
            success: true,
            message: `Escala de ${rota} salva com sucesso!`,
            dados: {
                id: escalaSalva.id,
                data: dataFormatada,
                tipo: rota,
                quantidadeMotoristas: motoristaIds.length
            }
        });

    } catch (error: any) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        console.error("Erro ao gerar escala:", error.message);
        return res.status(500).json({ 
            message: "Erro ao processar escala.",
            detalhe: error.message 
        });
    } finally {
        await queryRunner.release();
    }
});

//Rota para a edição parcial da escala:
router.patch("/escala/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const dadosParaAtualizar = req.body; // Ex: { tipoRota: 'VOLTA' }
        
        const repo = AppDataSource.getRepository(Escala);

        // Verifica se a escala existe
        const escala = await repo.findOneBy({ id: Number(id) });
        if (!escala) {
            return res.status(404).json({ message: "Escala não encontrada." });
        }

        // mescla os dados novos com os antigos (Object.assign ou repo.merge)
        repo.merge(escala, dadosParaAtualizar);
        
        const resultado = await repo.save(escala);

        return res.json({ 
            message: "Escala atualizada parcialmente com sucesso!", 
            escala: resultado 
        });
    } catch (error) {
        console.error("Erro no PATCH escala:", error);
        return res.status(500).json({ message: "Erro ao atualizar os dados da escala." });
    }
});

//Rota para deletar a escala: 
router.delete("/escala/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const repo = AppDataSource.getRepository(Escala);

        const escala = await repo.findOneBy({ id: Number(id) });
        if (!escala) return res.status(404).json({ message: "Escala não encontrada." });

        await repo.remove(escala);
        return res.json({ message: "Escala removida com sucesso!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao apagar a escala." });
    }
});

export default router;