import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Empresa } from "./Empresa";
import { Logradouro } from "./Logradouro";
import { Corrida } from "./Corrida";

@Entity("funcionario")
export class Funcionario {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @Column({unique: true})
    cpf: string;

    @ManyToOne(() => Empresa, empresa => empresa.funcionarios, { onDelete: "SET NULL" })
    empresa: Empresa;

    @ManyToOne(() => Logradouro, logradouro => logradouro.funcionarios, {cascade: true})
    logradouro: Logradouro;

    @ManyToOne(() => Corrida, corrida => corrida.funcionarios, {nullable: true},)
    @JoinColumn({ name: "corridaId" })
    corrida?: Corrida;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createDate: Date;
    
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP" })
    updateDate: Date;

    constructor(id?: number,
                nome?: string,
                cpf?: string,
                empresa?: Empresa,
                logradouro?: Logradouro,
                corrida?: Corrida,
                createDate?: Date,
                updateDate?: Date) {
        this.id = id!;
        this.nome = nome!;
        this.cpf = cpf!;
        this.empresa = empresa!;
        this.logradouro = logradouro!;
        this.corrida = corrida;
        this.createDate = createDate!;
        this.updateDate = updateDate!;
    }

}

