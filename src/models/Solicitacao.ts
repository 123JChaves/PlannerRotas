import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, JoinColumn, DeleteDateColumn } from "typeorm";
import { Empresa } from "./Empresa";
import { Corrida } from "./Corrida";
import { Funcionario } from "./Funcionario";

@Entity("solicitacao")
export class Solicitacao {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Funcionario, funcionario => funcionario.solicitacoes, { 
    onDelete: "CASCADE"
    })
    @JoinColumn({ name: "funcionarioId" })
    funcionario?: Funcionario;

    @ManyToOne(() => Empresa)
    empresa: Empresa;

    @Column()
    tipoRota: 'IDA' | 'VOLTA';

    @Column({ type: 'timestamp' })
    dataHoraAgendada: Date;

    @Column({ default: false })
    processada: boolean;

    @Column({ default: false })
    cancelada?: boolean;

    @DeleteDateColumn()
    deletedAt?: Date;

    @ManyToOne(() => Corrida, (corrida) => corrida.solicitacoes, { nullable: true })
    @JoinColumn({ name: "corridaId" })
    corrida: Corrida;

    constructor(
            id?: number, 
            empresa?: Empresa, 
            funcionario?: Funcionario, 
            tipoRota?: 'IDA' | 'VOLTA', 
            dataHoraAgendada?: Date, 
            processada?: boolean, 
            corrida?: Corrida,
            cancelada?: boolean,
            deletedAt?: Date,
        ) {
        this.id = id!;
        this.empresa = empresa!;
        this.funcionario = funcionario!;
        this.tipoRota = tipoRota!;
        this.dataHoraAgendada = dataHoraAgendada!;
        this.processada = processada!;
        this.corrida = corrida!;
        this.cancelada = cancelada;
        this.deletedAt = deletedAt;

    }
}