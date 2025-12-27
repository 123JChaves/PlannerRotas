import 'dotenv/config';
import mbxOptimization from '@mapbox/mapbox-sdk/services/optimization';
import express, { Request, Response } from "express";
import { Between, In, IsNull, Not } from "typeorm";
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
        
        const { empresaId, pagina, limite, dataInicio, dataFim } = req.query;
        
        const page = parseInt(pagina as string) || 1;
        const limit = parseInt(limite as string) || 10;
        const skip = (page - 1) * limit;

        const whereCondition: any = {};

        if (empresaId) {
            whereCondition.empresa = { id: Number(empresaId) };
        }

        if (dataInicio && dataFim) {
            whereCondition.inicioDaCorrida = Between(
                new Date(dataInicio as string), 
                new Date(dataFim as string)
            );
        }

        // 3. Execução da busca sem o bloco 'select' manual para evitar conflito de nomes de colunas
        const [corridas, total] = await corridaRepository.findAndCount({
            where: whereCondition,
            relations: [
                "motorista",
                "carro",
                "empresa",
                "funcionarios",
                "funcionarios.logradouro",
                "rotaIda",
                "rotaVolta"
            ],
            order: { inicioDaCorrida: "DESC" },
            take: limit,
            skip: skip
        });

        // 4. Resposta formatada
        return res.status(200).json({
            status: "success",
            dados: corridas.map(corrida => ({
                ...corrida,
                // Parse seguro do GeoJSON para o Mapbox
                geometriaIda: corrida.rotaIda?.geoJsonRota ? JSON.parse(corrida.rotaIda.geoJsonRota) : null,
                geometriaVolta: corrida.rotaVolta?.geoJsonRota ? JSON.parse(corrida.rotaVolta.geoJsonRota) : null
            })),
            meta: {
                totalRegistros: total,
                paginaAtual: page,
                totalPaginas: Math.ceil(total / limit),
                itensPorPagina: limit
            }
        });

    } catch (error: any) {
        console.error("Erro ao listar corridas:", error);
        return res.status(500).json({ 
            message: "Erro interno ao processar a listagem de corridas.",
            error: error.message 
        });
    }
});

// Rota para recuperar as informações de uma única corrida: 
router.get("/corrida/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const corridaRepository = AppDataSource.getRepository(Corrida);

        // Busca uma única corrida pelo ID com todas as relações para o mapa
        const corrida = await corridaRepository.findOne({
            where: { id: Number(id) },
            relations: [
                "motorista",
                "carro",
                "empresa",
                "funcionarios",
                "funcionarios.logradouro",
                "rotaIda",
                "rotaVolta"
            ],
        });

        // Caso a corrida não exista
        if (!corrida) {
            return res.status(404).json({ message: "Corrida não encontrada." });
        }

        // Formatação da resposta com parse do GeoJSON para o Mapbox
        const dadosFormatados = {
            ...corrida,
            geometriaIda: corrida.rotaIda?.geoJsonRota ? JSON.parse(corrida.rotaIda.geoJsonRota) : null,
            geometriaVolta: corrida.rotaVolta?.geoJsonRota ? JSON.parse(corrida.rotaVolta.geoJsonRota) : null
        };

        return res.status(200).json(dadosFormatados);

    } catch (error: any) {
        console.error("Erro ao buscar detalhes da corrida:", error);
        return res.status(500).json({ 
            message: "Erro ao buscar detalhes da corrida!",
            error: error.message 
        });
    }
});

router.post("/corridas/processar-solicitacoes", async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
        const optimizationClient = getOptimizationClient();
        const { empresaId, motoristaIds, funcionarioIds, tipoRota } = req.body;

        await queryRunner.connect();
        await queryRunner.startTransaction();

        // 1. Busca Empresa e Funcionários com GPS
        const empresa = await queryRunner.manager.findOne(Empresa, {
            where: { id: empresaId },
            relations: ["logradouro"]
        });

        if (!empresa?.logradouro?.latitude) throw new Error("GPS da empresa não configurado.");

        const funcionarios = await queryRunner.manager.getRepository(Funcionario).find({
            where: { id: In(funcionarioIds) },
            relations: ["logradouro"]
        });

        const validos = funcionarios.filter(f => f.logradouro?.latitude != null);
        
        // 2. Agrupamento (Máximo 4 por carro)
        const gruposDeQuatro = [];
        for (let i = 0; i < validos.length; i += 4) {
            gruposDeQuatro.push(validos.slice(i, i + 4));
        }

        const resultados = [];

        for (let index = 0; index < gruposDeQuatro.length; index++) {
            const grupoOriginal = gruposDeQuatro[index];
            
            // --- REGRA DE MOTORISTA ---
            let motoristaIdFinal: number;
            if (tipoRota === "VOLTA") {
                const corridaIdaAnterior = await queryRunner.manager.findOne(Corrida, {
                    where: { funcionarios: { id: grupoOriginal[0].id }, rotaIda: Not(IsNull()) },
                    order: { inicioDaCorrida: "DESC" },
                    relations: ["motorista"]
                });
                motoristaIdFinal = corridaIdaAnterior ? corridaIdaAnterior.motorista.id : (motoristaIds[index] || motoristaIds[0]);
            } else {
                motoristaIdFinal = motoristaIds[index] || motoristaIds[0];
            }

            const motoristaData = await queryRunner.manager.getRepository(Motorista).findOne({
                where: { id: motoristaIdFinal },
                relations: ["carroAtual"]
            });

            if (!motoristaData?.carroAtual) throw new Error(`Motorista ${motoristaIdFinal} sem veículo.`);

            // --- 3. ORDENAÇÃO VIA MAPBOX OPTIMIZATION API ---
            // Formata coordenadas para o Mapbox [longitude, latitude]
            const coordsFuncionarios = grupoOriginal.map(f => ({
                id: f.id,
                coordinates: [f.logradouro.longitude, f.logradouro.latitude] as [number, number]
            }));
            const coordEmpresa = [empresa.logradouro.longitude, empresa.logradouro.latitude] as [number, number];

            // Monta os pontos: No Mapbox, o primeiro ponto é o início
            // IDA: Funcionários -> Empresa | VOLTA: Empresa -> Funcionários
            const points = tipoRota === "IDA" 
                ? [...coordsFuncionarios.map(c => ({ coordinates: c.coordinates })), { coordinates: coordEmpresa }]
                : [{ coordinates: coordEmpresa }, ...coordsFuncionarios.map(c => ({ coordinates: c.coordinates }))];

            const response = await optimizationClient.getOptimization({
                profile: 'driving-traffic',
                waypoints: points,
                source: 'first', // Força iniciar no primeiro ponto da lista
                destination: 'last' // Força terminar no último ponto da lista
            }).send();

            // Reordena o array original baseado no índice retornado pelo MapBox
            // O Mapbox retorna 'waypoint_index' que corresponde à ordem na lista de 'points'
            const ordemMapbox = response.body.waypoints
                .sort((a: any, b: any) => a.waypoint_index - b.waypoint_index)
                .map((wp: any) => wp.location); // Coordenadas ordenadas

            const grupoOrdenado = tipoRota === "IDA"
                ? [...grupoOriginal].sort((a, b) => {
                    const idxA = ordemMapbox.findIndex((c: any) => c[0] === a.logradouro.longitude);
                    const idxB = ordemMapbox.findIndex((c: any) => c[0] === b.logradouro.longitude);
                    return idxA - idxB;
                })
                : [...grupoOriginal].sort((a, b) => {
                    const idxA = ordemMapbox.findIndex((c: any) => c[0] === a.logradouro.longitude);
                    const idxB = ordemMapbox.findIndex((c: any) => c[0] === b.logradouro.longitude);
                    return idxA - idxB;
                });

            const ordemIds = grupoOrdenado.map(f => f.id).join(",");

            // --- 4. SALVAMENTO ---
            const rotaSalva = await queryRunner.manager.save(
                tipoRota === "IDA" ? RotaIda : RotaVolta, 
                {
                    funcionarios: grupoOrdenado,
                    empresa: { id: empresaId },
                    ordemDasParadas: ordemIds,
                    geometryMapbox: JSON.stringify(response.body.trips[0]?.geometry) // Opcional: salva o desenho da rota
                }
            );

            const novaCorrida = queryRunner.manager.create(Corrida, {
                empresa: { id: empresaId },
                motorista: motoristaData,
                carro: motoristaData.carroAtual,
                funcionarios: grupoOrdenado,
                rotaIda: tipoRota === "IDA" ? rotaSalva : null,
                rotaVolta: tipoRota === "VOLTA" ? rotaSalva : null,
                inicioDaCorrida: new Date()
            });

            const corridaFinal = await queryRunner.manager.save(novaCorrida);

            await queryRunner.manager.update(Solicitacao,
                { 
                    funcionario: { id: In(grupoOrdenado.map(f => f.id)) }, 
                    processada: false,
                    tipoRota: tipoRota 
                },
                { processada: true, corrida: corridaFinal }
            );

            resultados.push(corridaFinal);
        }

        await queryRunner.commitTransaction();
        return res.status(201).json({ message: `Processamento concluído.`, corridas: resultados });

    } catch (error: any) {
        await queryRunner.rollbackTransaction();
        return res.status(500).json({ message: error.message });
    } finally {
        await queryRunner.release();
    }
});

router.post("/corridas/processar-janela-solicitacoes", async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
        const optimizationClient = getOptimizationClient();
        const { empresaId, tipoRota, dataHoraBase, janelaMinutos } = req.body;
        
        const inicioJanela = new Date(dataHoraBase);
        const fimJanela = new Date(inicioJanela.getTime() + (janelaMinutos || 0) * 60000);
        const dataEscala = inicioJanela.toISOString().split('T')[0];

        await queryRunner.connect();
        await queryRunner.startTransaction();

        // 1. Busca Escala e Empresa
        const escala = await queryRunner.manager.findOne(Escala, { where: { data: dataEscala } });
        if (!escala?.motoristaIds?.length) {
            throw new Error(`Escala não definida para a data ${dataEscala}.`);
        }

        const empresa = await queryRunner.manager.findOne(Empresa, {
            where: { id: empresaId },
            relations: ["logradouro"]
        });
        if (!empresa?.logradouro?.latitude) {
            throw new Error("GPS da empresa não configurado.");
        }

        // 2. Busca Solicitações
        const solicitacoes = await queryRunner.manager.find(Solicitacao, {
            where: {
                empresa: { id: empresaId },
                tipoRota,
                processada: false,
                dataHoraAgendada: Between(inicioJanela, fimJanela)
            },
            relations: ["funcionario", "funcionario.logradouro"]
        });

        const validas = solicitacoes.filter(s => s.funcionario?.logradouro?.latitude != null);
        if (validas.length === 0) {
            return res.status(200).json({ message: "Sem solicitações válidas." });
        }

        // 3. Ordenação Geográfica Base (Latitude)
        validas.sort((a, b) => Number(a.funcionario.logradouro.latitude) - Number(b.funcionario.logradouro.latitude));

        const resultados = [];
        const motoristasIds = escala.motoristaIds;
        let motoristaIndex = 0;

        // 4. Processamento em Lotes de 4
        for (let i = 0; i < validas.length; i += 4) {
            if (motoristaIndex >= motoristasIds.length) break;

            const loteSolicitacoes = validas.slice(i, i + 4);
            const funcionariosGrupo: Funcionario[] = loteSolicitacoes.map(s => s.funcionario);
            const motoristaId = motoristasIds[motoristaIndex];

            const coordEmpresa: [number, number] = [Number(empresa.logradouro.longitude), Number(empresa.logradouro.latitude)];
            
            // TIPAGEM EXPLÍCITA (f: any) ou (f: Funcionario) resolve o erro de parâmetro implícito
            const coordsFuncs = funcionariosGrupo.map((f: any) => [
                Number(f.logradouro.longitude), 
                Number(f.logradouro.latitude)
            ] as [number, number]);

            const waypoints = tipoRota === "IDA" 
                ? [...coordsFuncs.map(c => ({ coordinates: c })), { coordinates: coordEmpresa }]
                : [{ coordinates: coordEmpresa }, ...coordsFuncs.map(c => ({ coordinates: c }))];

            // 5. Chamada Mapbox Optimization
            const response = await optimizationClient.getOptimization({
                profile: 'driving-traffic',
                waypoints: waypoints,
                source: 'first',
                destination: 'last',
                geometries: 'geojson'
            }).send();

            const waypointsOrdenados = response.body.waypoints.sort((a: any, b: any) => a.waypoint_index - b.waypoint_index);
            
            // Reordenamento e limpeza do ponto da empresa
            const funcionariosOrdenados = waypointsOrdenados
                .map((wp: any) => {
                    const idxOriginal = wp.location_index;
                    if (tipoRota === "IDA") {
                        return idxOriginal < funcionariosGrupo.length ? funcionariosGrupo[idxOriginal] : null;
                    } else {
                        return idxOriginal > 0 ? funcionariosGrupo[idxOriginal - 1] : null;
                    }
                })
                .filter((f: any): f is Funcionario => f !== null);

            // 6. Salvamento da Rota e Corrida
            const ordemIds = funcionariosOrdenados.map((f: any) => f.id).join(",");
            const geoJson = JSON.stringify(response.body.trips[0].geometry);

            const rota = await queryRunner.manager.save(tipoRota === "IDA" ? RotaIda : RotaVolta, {
                funcionarios: funcionariosOrdenados,
                empresa: { id: empresaId },
                ordemDasParadas: ordemIds,
                geometry: geoJson
            });

            const corrida = await queryRunner.manager.save(Corrida, {
                empresa: { id: empresaId },
                motorista: { id: motoristaId },
                funcionarios: funcionariosOrdenados,
                rotaIda: tipoRota === "IDA" ? rota : null,
                rotaVolta: tipoRota === "VOLTA" ? rota : null,
                inicioDaCorrida: inicioJanela
            });

            // Baixa nas solicitações
            await queryRunner.manager.update(Solicitacao,
                { id: In(loteSolicitacoes.map(s => s.id)) },
                { processada: true, corrida: corrida }
            );

            resultados.push(corrida);
            motoristaIndex++;
        }

        await queryRunner.commitTransaction();

        return res.status(201).json({
            message: "Processamento concluído.",
            corridasGeradas: resultados.length,
            status: motoristaIndex < Math.ceil(validas.length / 4) ? "Faltam motoristas" : "OK"
        });

    } catch (error: any) {
        if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        console.error(error);
        return res.status(500).json({ message: error.message });
    } finally {
        await queryRunner.release();
    }
});

router.delete("/corrida/:id", async (req:Request, res:Response) => {
    try {
        const {id} = req.params;
        const corridaRepository = AppDataSource.getRepository(Corrida);

        const corrida = await corridaRepository.findOne({
            where: {id: parseInt(id)},
        });

        if(!corrida) {
            return res.status(400).json({
                message: "Registro de corrida não encontrado!"
            });
        }

        await corridaRepository.remove(corrida);

        return res.status(200).json({
            message: "Registro de corrida removido com sucesso!"
        });
        
    } catch (error:any) {
        console.error(error)
        return res.status(500).json({
            message: "Erro ao deletar o registro da corrida!"
        });
    }
});

export default router;