import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import {Empresa} from "./Empresa";
import { Corrida } from "./Corrida";
import { Funcionario } from "./Funcionario";

@Entity("solicitacao")
export class Solicitacao {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Funcionario)
    funcionario: Funcionario;

    @ManyToOne(() => Empresa)
    empresa: Empresa;

    @Column()
    tipoRota: 'IDA' | 'VOLTA';

    @Column({ type: 'timestamp' })
    dataHoraAgendada: Date; // Ex: 2025-12-23 03:00:00

    @Column({ default: false })
    processada: boolean; // Indica se já virou uma corrida

    @ManyToOne(() => Corrida, (corrida) => corrida.solicitacoes, { nullable: true })
    @JoinColumn({ name: "corridaId" })
    corrida: Corrida; // A solicitação "ganha" uma corrida quando é processada


    constructor(id?: number,
                empresa?: Empresa,
                funcionario?: Funcionario,
                tipoRota?: 'IDA' | 'VOLTA',
                dataHoraAgendada?: Date,
                processada?: boolean,
                corrida?: Corrida
            ) {
                this.id = id!;
                this.empresa = empresa!;
                this.funcionario = funcionario!;
                this.tipoRota = tipoRota!;
                this.dataHoraAgendada = dataHoraAgendada!;
                this.processada = processada!;
                this.corrida = corrida!;
                }
}