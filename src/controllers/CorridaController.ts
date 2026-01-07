import 'dotenv/config';
import mbxOptimization from '@mapbox/mapbox-sdk/services/optimization';
import express, { Request, Response } from "express";
import { Between, FindOptionsWhere, In, IsNull, Not } from "typeorm";
import { AppDataSource } from "../data-source";
import { Corrida } from "../models/Corrida";
import { RotaIda } from "../models/RotaIda";
import { RotaVolta } from "../models/RotaVolta";
import { Funcionario } from "../models/Funcionario";
import { Solicitacao } from "../models/Solicitacao";
import { Empresa } from "../models/Empresa";
import { Escala } from "../models/Escala";
import { Motorista } from "../models/Motorista";

const getOptimizationClient = () => {
    const token = process.env.JWT_PLANNER;
    if (!token) {
        throw new Error("Erro: A variável de ambiente JWT_PLANNER não foi carregada corretamente.");
    }
    return mbxOptimization({ accessToken: token });
};

const router = express.Router();

// Rota para a visualização de corridas realizadas:
router.get("/corrida", async (req: Request, res: Response) => {
    try {
        const corridaRepository = AppDataSource.getRepository(Corrida);
        
        // Destruturação com tipos e valores padrão
        const { empresaId, pagina, limite, dataInicio, dataFim, motoristaId } = req.query;
        
        const page = Math.max(1, parseInt(pagina as string) || 1);
        const limit = Math.min(100, parseInt(limite as string) || 10); // Cap de 100 para segurança
        const skip = (page - 1) * limit;

        // Construção dinâmica e tipada do filtro
        const whereCondition: FindOptionsWhere<Corrida> = {};

        if (empresaId) {
            whereCondition.empresa = { id: Number(empresaId) };
        }

        if (motoristaId) {
            whereCondition.motorista = { id: Number(motoristaId) };
        }

        if (dataInicio && dataFim) {
            // Ajuste para cobrir o dia inteiro (de 00:00:00 a 23:59:59)
            const inicio = new Date(dataInicio as string);
            const fim = new Date(dataFim as string);
            if (!isNaN(inicio.getTime()) && !isNaN(fim.getTime())) {
                whereCondition.inicioDaCorrida = Between(inicio, fim);
            }
        }

        const [corridas, total] = await corridaRepository.findAndCount({
            where: whereCondition,
            relations: {
                motorista: { pessoa: true },
                carro: true,
                empresa: true,
                funcionarios: { pessoa: true, logradouro: true },
                rotaIda: true,
                rotaVolta: true
            },
            order: { inicioDaCorrida: "DESC" },
            take: limit,
            skip: skip
        });

        // Formatação eficiente
        const dadosFormatados = corridas.map(corrida => {
            // Helper para parse seguro de JSON
            const safeParse = (jsonStr?: string | null) => {
                if (!jsonStr) return null;
                try { return JSON.parse(jsonStr); } catch { return null; }
            };

            return {
                id: corrida.id,
                data: {
                    inicio: corrida.inicioDaCorrida,
                    fim: corrida.fimDaCorrida || "Em andamento"
                },
                // Prioriza dados vivos, mas exibe log histórico se motorista/veículo foram alterados/deletados
                atribuicao: {
                    motorista: corrida.motorista?.pessoa?.nome || "Motorista não disponível",
                    carro: corrida.carro?.placa || "Veículo não disponível",
                    empresa: corrida.empresa?.nome || "N/A"
                },
                passageiros: {
                    lista: corrida.funcionarios?.map(f => f.pessoa?.nome) || [],
                    total: corrida.funcionarios?.length || 0
                },
                // Snapshot guardado no momento da criação da corrida (Auditoria)
                logHistorico: corrida.logNomesParticipantes,
                logistica: {
                    tipo: corrida.rotaIda ? "IDA" : "VOLTA",
                    geoJson: safeParse(corrida.rotaIda?.geoJsonRota || corrida.rotaVolta?.geoJsonRota),
                    ordemParadas: corrida.rotaIda?.ordemDasParadas || corrida.rotaVolta?.ordemDasParadas
                }
            };
        });

        return res.status(200).json({
            success: true,
            meta: {
                total,
                paginas: Math.ceil(total / limit),
                paginaAtual: page,
                limite: limit
            },
            dados: dadosFormatados
        });

    } catch (error: any) {
        console.error(`[GET /corrida] Erro: ${error.message}`);
        return res.status(500).json({ 
            success: false,
            message: "Erro ao listar corridas.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
});

// Rota para recuperar as informações de uma única corrida: 
router.get("/corrida/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const corridaRepository = AppDataSource.getRepository(Corrida);

        // 1. Busca otimizada com seleção específica de relações
        const corrida = await corridaRepository.findOne({
            where: { id: Number(id) },
            relations: {
                motorista: { pessoa: true },
                carro: true,
                empresa: { logradouro: true },
                funcionarios: { pessoa: true, logradouro: true },
                rotaIda: true,
                rotaVolta: true
            },
        });

        if (!corrida) {
            return res.status(404).json({ success: false, message: "Corrida não encontrada." });
        }

        // Helper para Parse seguro de JSON (evita erro 500 se o banco tiver dado inválido)
        const safeParse = (str?: string | null) => {
            if (!str) return null;
            try { return JSON.parse(str); } catch { return null; }
        };

        // 2. Construção de um DTO (Data Transfer Object) limpo e semântico
        const dadosFormatados = {
            id: corrida.id,
            tipo: corrida.rotaIda ? "IDA" : "VOLTA",
            status: {
                inicio: corrida.inicioDaCorrida,
                fim: corrida.fimDaCorrida || "Em andamento",
            },
            atribuicao: {
                motorista: {
                    id: corrida.motorista?.id,
                    nome: corrida.motorista?.pessoa?.nome || "Motorista não vinculado",
                    cpf: corrida.motorista?.pessoa?.cpf || "N/A"
                },
                veiculo: {
                    id: corrida.carro?.id,
                    placa: corrida.carro?.placa || "N/A",
                    modelo: corrida.carro?.modelo || "N/A"
                },
                empresa: {
                    nome: corrida.empresa?.nome,
                    coordenadas: [corrida.empresa?.logradouro?.longitude, corrida.empresa?.logradouro?.latitude]
                }
            },
            passageiros: (corrida.funcionarios || []).map(f => ({
                id: f.id,
                nome: f.pessoa?.nome || "Funcionário Removido",
                coordenadas: [f.logradouro?.longitude, f.logradouro?.latitude]
            })),
            mapa: {
                // Consolida a rota independente de ser ida ou volta
                geoJson: safeParse(corrida.rotaIda?.geoJsonRota || corrida.rotaVolta?.geoJsonRota),
                ordemParadas: (corrida.rotaIda?.ordemDasParadas || corrida.rotaVolta?.ordemDasParadas || "")
                    .split(",")
                    .filter(id => id !== "")
                    .map(Number)
            },
            // Log imutável gerado no momento da criação para fins de auditoria
            snapshotHistorico: corrida.logNomesParticipantes
        };

        return res.status(200).json({
            success: true,
            dados: dadosFormatados
        });

    } catch (error: any) {
        console.error(`[GET /corrida/:id] Erro: ${error.message}`);
        return res.status(500).json({ 
            success: false,
            message: "Erro interno ao processar detalhes da corrida.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
});

// Rota para processar as solicitações:
router.post("/corridas/processar-solicitacoes", async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
        const { empresaId, motoristaIds, funcionarioIds, tipoRota, data } = req.body;
        const optimizationClient = getOptimizationClient();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        // 1. Carregamento da Empresa
        const empresa = await queryRunner.manager.findOne(Empresa, {
            where: { id: empresaId },
            relations: ["logradouro"]
        });
        if (!empresa?.logradouro?.latitude) throw new Error("GPS da empresa não configurado.");

        // 2. Determinação da Fila de Motoristas (Diferenciando Escala de IDA e VOLTA)
        let filaIds: number[] = [];
        if (motoristaIds && motoristaIds.length > 0) {
            filaIds = motoristaIds; // Modo Manual
        } else {
            const dataBusca = data || new Date().toISOString().split('T')[0];
            const escala = await queryRunner.manager.findOne(Escala, {
                where: { 
                    data: dataBusca, 
                    tipoRota: tipoRota // Busca a escala específica (IDA ou VOLTA)
                },
                relations: ["motoristasOrdem", "motoristasOrdem.motorista"]
            });

            if (!escala) throw new Error(`Escala de ${tipoRota} não encontrada para ${dataBusca}.`);
            
            // Ordenação manual definida na escala
            filaIds = escala.motoristasOrdem
                .sort((a, b) => a.ordem! - b.ordem!)
                .map(m => m.motorista!.id);
        }

        if (filaIds.length === 0) throw new Error("Nenhum motorista disponível.");

        // 3. Busca em lote de Motoristas (Evita múltiplas consultas ao banco)
        const motoristasMap = new Map<number, Motorista>();
        const dadosMotoristas = await queryRunner.manager.find(Motorista, {
            where: { id: In(filaIds) },
            relations: ["carroAtual", "pessoa"]
        });
        dadosMotoristas.forEach(m => motoristasMap.set(m.id, m));

        // 4. Carregamento dos Funcionários
        const funcionarios = await queryRunner.manager.find(Funcionario, {
            where: { id: In(funcionarioIds) },
            relations: ["logradouro", "pessoa"]
        });

        const validos = funcionarios.filter(f => f.logradouro?.latitude != null);
        const grupos = Array.from({ length: Math.ceil(validos.length / 4) }, (_, i) => 
            validos.slice(i * 4, i * 4 + 4)
        );

        const resultados: Corrida[] = [];

        // 5. Processamento dos Grupos
        for (let i = 0; i < grupos.length; i++) {
            const grupo = grupos[i];
            let motoristaIdFinal: number;

            if (tipoRota === "VOLTA") {
                // Tenta manter o motorista que fez a IDA para este grupo específico
                const idaAnterior = await queryRunner.manager.findOne(Corrida, {
                    where: { funcionarios: { id: grupo[0].id }, rotaIda: Not(IsNull()) },
                    order: { inicioDaCorrida: "DESC" },
                    relations: ["motorista"]
                });
                
                // Se não achar a ida, usa o motorista da escala de VOLTA na posição atual
                motoristaIdFinal = idaAnterior?.motorista?.id || filaIds[i] || filaIds[0];
            } else {
                // Na IDA, segue rigorosamente a escala de IDA
                motoristaIdFinal = filaIds[i] || filaIds[0];
            }

            const motoristaData = motoristasMap.get(motoristaIdFinal);
            if (!motoristaData?.carroAtual) throw new Error(`Motorista ${motoristaIdFinal} sem veículo vinculado.`);

            // 6. Otimização Mapbox (Logística de IDA vs VOLTA)
            const coordEmpresa = [empresa.logradouro.longitude, empresa.logradouro.latitude] as [number, number];
            const coordFuncs = grupo.map(f => ({ coordinates: [f.logradouro!.longitude, f.logradouro!.latitude] as [number, number] }));

            const waypoints = tipoRota === "IDA" 
                ? [...coordFuncs, { coordinates: coordEmpresa }] 
                : [{ coordinates: coordEmpresa }, ...coordFuncs];

            const response = await optimizationClient.getOptimization({
                profile: 'driving-traffic',
                waypoints: waypoints,
                source: 'first',
                destination: 'last'
            }).send();

            const waypointLocations = response.body.waypoints
                .sort((a: any, b: any) => a.waypoint_index - b.waypoint_index)
                .map((wp: any) => wp.location);

            const grupoOrdenado = [...grupo].sort((a, b) => {
                const posA = waypointLocations.findIndex((loc: any) => loc[0] === a.logradouro!.longitude);
                const posB = waypointLocations.findIndex((loc: any) => loc[0] === b.logradouro!.longitude);
                return posA - posB;
            });

            // 7. Salvamento da Rota e Corrida com Snapshot
            const rotaSalva = await queryRunner.manager.save(tipoRota === "IDA" ? RotaIda : RotaVolta, {
                funcionarios: grupoOrdenado,
                empresa: { id: empresaId },
                ordemDasParadas: grupoOrdenado.map(f => f.id).join(","),
                geoJsonRota: JSON.stringify(response.body.trips[0]?.geometry)
            });

            const snapshot = `Motorista: ${motoristaData.pessoa!.nome} | Carro: ${motoristaData.carroAtual.placa} | Passageiros: ${grupoOrdenado.map(f => f.pessoa!.nome).join(", ")}`;

            const novaCorrida = queryRunner.manager.create(Corrida, {
                empresa,
                motorista: motoristaData,
                carro: motoristaData.carroAtual,
                funcionarios: grupoOrdenado,
                rotaIda: tipoRota === "IDA" ? (rotaSalva as RotaIda) : null,
                rotaVolta: tipoRota === "VOLTA" ? (rotaSalva as RotaVolta) : null,
                logNomesParticipantes: snapshot,
                inicioDaCorrida: new Date()
            });

            const corridaSalva = await queryRunner.manager.save(novaCorrida);

            // 8. Atualização das Solicitações
            await queryRunner.manager.update(Solicitacao, 
                { funcionario: { id: In(grupoOrdenado.map(f => f.id)) }, processada: false, tipoRota },
                { processada: true, corrida: corridaSalva }
            );

            resultados.push(corridaSalva);
        }

        await queryRunner.commitTransaction();
        return res.status(201).json({ message: "Processamento concluído com sucesso", corridas: resultados });

    } catch (error: any) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        console.error("Erro no Router:", error.message);
        return res.status(500).json({ message: error.message });
    } finally {
        await queryRunner.release();
    }
});

// Rota para processar uma janela de solicitações:
router.post("/corridas/processar-janela-solicitacoes", async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
        const { empresaId, tipoRota, dataHoraBase, janelaMinutos } = req.body;
        const optimizationClient = getOptimizationClient();
        
        const inicioJanela = new Date(dataHoraBase);
        const fimJanela = new Date(inicioJanela.getTime() + (janelaMinutos || 0) * 60000);
        const dataEscala = inicioJanela.toISOString().split('T')[0];

        await queryRunner.connect();
        await queryRunner.startTransaction();

        // 1. Busca Escala (específica por tipo) e Empresa
        const escala = await queryRunner.manager.findOne(Escala, { 
            where: { data: dataEscala, tipoRota: tipoRota },
            relations: ["motoristasOrdem", "motoristasOrdem.motorista", "motoristasOrdem.motorista.pessoa", "motoristasOrdem.motorista.carroAtual"]
        });

        if (!escala || escala.motoristasOrdem.length === 0) {
            throw new Error(`Escala de ${tipoRota} não definida para a data ${dataEscala}.`);
        }

        const empresa = await queryRunner.manager.findOne(Empresa, {
            where: { id: empresaId },
            relations: ["logradouro"]
        });
        if (!empresa?.logradouro?.latitude) throw new Error("GPS da empresa não configurado.");

        // 2. Busca Solicitações Pendentes na Janela
        const solicitacoes = await queryRunner.manager.find(Solicitacao, {
            where: {
                empresa: { id: empresaId },
                tipoRota,
                processada: false,
                dataHoraAgendada: Between(inicioJanela, fimJanela)
            },
            relations: ["funcionario", "funcionario.logradouro", "funcionario.pessoa"]
        });

        const validas = solicitacoes.filter(s => s.funcionario?.logradouro?.latitude != null);
        if (validas.length === 0) {
            await queryRunner.rollbackTransaction();
            return res.status(200).json({ message: "Sem solicitações válidas na janela informada." });
        }

        // 3. Preparação da Fila de Motoristas da Escala
        const filaMotoristas = escala.motoristasOrdem
            .sort((a, b) => a.ordem! - b.ordem!)
            .map(em => em.motorista);

        const resultados: Corrida[] = [];
        let motoristaIndex = 0;

        // 4. Processamento em Lotes (Capacidade máxima de 4 passageiros)
        for (let i = 0; i < validas.length; i += 4) {
            // Verifica se ainda há motoristas na escala para atender o próximo lote
            if (motoristaIndex >= filaMotoristas.length) break;

            const loteSolicitacoes = validas.slice(i, i + 4);
            const funcionariosGrupo = loteSolicitacoes.map(s => s.funcionario!);
            const motoristaData = filaMotoristas[motoristaIndex];

            if (!motoristaData!.carroAtual) {
                throw new Error(`Motorista ${motoristaData!.pessoa!.nome} está na escala mas não possui carro vinculado.`);
            }

            // 5. Configuração de Pontos para Mapbox
            const coordEmpresa: [number, number] = [Number(empresa.logradouro.longitude), Number(empresa.logradouro.latitude)];
            const coordFuncs = funcionariosGrupo.map(f => [Number(f.logradouro!.longitude), Number(f.logradouro!.latitude)] as [number, number]);

            const waypoints = tipoRota === "IDA" 
                ? [...coordFuncs.map(c => ({ coordinates: c })), { coordinates: coordEmpresa }]
                : [{ coordinates: coordEmpresa }, ...coordFuncs.map(c => ({ coordinates: c }))];

            const response = await optimizationClient.getOptimization({
                profile: 'driving-traffic',
                waypoints,
                source: 'first',
                destination: 'last',
                geometries: 'geojson'
            }).send();

            // Reordenar funcionários conforme otimização do GPS
            const waypointLocations = response.body.waypoints
                .sort((a: any, b: any) => a.waypoint_index - b.waypoint_index)
                .map((wp: any) => wp.location);

            const funcionariosOrdenados = [...funcionariosGrupo].sort((a, b) => {
                const posA = waypointLocations.findIndex((loc: any) => loc[0] === a.logradouro!.longitude);
                const posB = waypointLocations.findIndex((loc: any) => loc[0] === b.logradouro!.longitude);
                return posA - posB;
            });

            // 6. Snapshot imutável e Persistência da Rota
            const nomesPassageiros = funcionariosOrdenados.map(f => f.pessoa?.nome || "N/A").join(", ");
            const snapshot = `Motorista: ${motoristaData!.pessoa!.nome} | Carro: ${motoristaData!.carroAtual.placa} | Passageiros: ${nomesPassageiros}`;

            const rota = await queryRunner.manager.save(tipoRota === "IDA" ? RotaIda : RotaVolta, {
                funcionarios: funcionariosOrdenados,
                empresa: { id: empresaId },
                ordemDasParadas: funcionariosOrdenados.map(f => f.id).join(","),
                geoJsonRota: JSON.stringify(response.body.trips[0].geometry)
            });

            // 7. Criação da Corrida
            const novaCorrida = queryRunner.manager.create(Corrida, {
                empresa: { id: empresaId },
                motorista: motoristaData,
                carro: motoristaData!.carroAtual,
                funcionarios: funcionariosOrdenados,
                rotaIda: tipoRota === "IDA" ? (rota as RotaIda) : null,
                rotaVolta: tipoRota === "VOLTA" ? (rota as RotaVolta) : null,
                inicioDaCorrida: inicioJanela, // Mantém a hora base da janela como início
                logNomesParticipantes: snapshot
            });

            const corridaSalva = await queryRunner.manager.save(novaCorrida);

            // 8. Vincula solicitações à corrida e marca como processadas
            await queryRunner.manager.update(Solicitacao,
                { id: In(loteSolicitacoes.map(s => s.id)) },
                { processada: true, corrida: corridaSalva }
            );

            resultados.push(corridaSalva);
            motoristaIndex++;
        }

        await queryRunner.commitTransaction();
        
        return res.status(201).json({
            message: "Processamento por janela concluído.",
            corridasGeradas: resultados.length,
            motoristasUtilizados: motoristaIndex,
            totalSolicitacoesProcessadas: resultados.length * 4 > validas.length ? validas.length : resultados.length * 4
        });

    } catch (error: any) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        console.error("Erro Processamento Janela:", error.message);
        return res.status(500).json({ message: error.message });
    } finally {
        await queryRunner.release();
    }
});

// Rota para deletar uma corrida específica:
router.delete("/corrida/:id", async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
        const { id } = req.params;
        const corridaId = parseInt(id);

        await queryRunner.connect();
        await queryRunner.startTransaction();

        // 1. Busca a corrida e suas relações de rota
        // Não precisamos carregar 'solicitacoes' aqui para economizar memória,
        // pois faremos o update via QueryBuilder.
        const corrida = await queryRunner.manager.findOne(Corrida, {
            where: { id: corridaId },
            relations: ["rotaIda", "rotaVolta"]
        });

        if (!corrida) {
            return res.status(404).json({ success: false, message: "Corrida não encontrada." });
        }

        // 2. Reset das Solicitações (Voltam a ficar pendentes para novo processamento)
        // Usamos o queryRunner para garantir que esta alteração faça parte da transação
        await queryRunner.manager.createQueryBuilder()
            .update(Solicitacao)
            .set({ 
                processada: false, 
                corrida: null 
            })
            .where("corridaId = :id", { id: corridaId })
            .execute();

        // 3. Remoção da Corrida
        // Se as entidades RotaIda/RotaVolta estiverem com { cascade: true } ou { onDelete: 'CASCADE' },
        // as rotas serão apagadas automaticamente ao remover a corrida.
        await queryRunner.manager.remove(Corrida, corrida);

        await queryRunner.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Corrida removida e solicitações liberadas com sucesso."
        });
        
    } catch (error: any) {
        // Se algo falhar, desfazemos todas as alterações (rollback)
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        
        console.error(`[DELETE /corrida/${req.params.id}] Erro:`, error.message);
        return res.status(500).json({
            success: false,
            message: "Erro ao deletar o registro da corrida.",
            error: error.message
        });
    } finally {
        // Obrigatório liberar o queryRunner
        await queryRunner.release();
    }
});

export default router;