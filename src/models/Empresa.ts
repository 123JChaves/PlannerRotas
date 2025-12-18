import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Funcionario } from "./Funcionario";
import { Logradouro } from "./Logradouro";
import { Corrida } from "./Corrida";

@Entity("empresa")
export class Empresa {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @OneToMany(() => Funcionario, funcionario => funcionario.empresa)
    funcionarios?: Funcionario[];

    @ManyToOne(() => Logradouro, logradouro => logradouro.empresas, {cascade: true})
    logradouro: Logradouro;

    @OneToMany(() => Corrida, corrida => corrida.empresa)
    corridas?: Corrida[];

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createDate: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP" })
    updateDate: Date;

    constructor(id?: number,
                nome?: string,
                funcionarios?: Funcionario[],
                logradouro?: Logradouro,
                corridas?: Corrida [],
                createDate?: Date,
                updateDate?: Date)
    {
        this.id = id!;
        this.nome = nome!;
        if (funcionarios) {
            this.funcionarios = funcionarios;
        }
        this.logradouro = logradouro!;
        if (corridas) {
        this.corridas = corridas;
        }
        this.createDate = createDate!;
        this.updateDate = updateDate!;
    }

}