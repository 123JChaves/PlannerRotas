import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Empresa } from "./Empresa";
import { Logradouro } from "./Logradouro";
import { Corrida } from "./Corrida";

@Entity("funcionario")
export class Funcionario {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @ManyToOne(() => Empresa, empresa => empresa.funcionarios)
    empresa: Empresa;

    @ManyToOne(() => Logradouro, logradouro => logradouro.funcionarios, {cascade: true})
    logradouro: Logradouro;

    @ManyToOne(() => Corrida, corrida => corrida.funcionarios, {nullable: true})
    @JoinColumn({ name: "corridaId" })
    corrida?: Corrida;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createDate: Date;
    
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP" })
    updateDate: Date;

    constructor(id?: number,
                nome?: string,
                empresa?: Empresa,
                logradouro?: Logradouro,
                corrida?: Corrida,
                createDate?: Date,
                updateDate?: Date) {
        this.id = id!;
        this.nome = nome!;
        this.empresa = empresa!;
        this.logradouro = logradouro!;
        this.corrida = corrida;
        this.createDate = createDate!;
        this.updateDate = updateDate!;
    }

}

