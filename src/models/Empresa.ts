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

    @Column({unique: true})
    cnpj: string;

    @ManyToOne(() => Logradouro, logradouro => logradouro.empresas, {cascade: true})
    logradouro: Logradouro;

    @OneToMany(() => Funcionario, funcionario => funcionario.empresa)
    funcionarios?: Funcionario[];

    @OneToMany(() => Corrida, corrida => corrida.empresa)
    corridas?: Corrida[];

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createDate: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP" })
    updateDate: Date;

    constructor(id?: number,
                nome?: string,
                logradouro?: Logradouro,
                cnpj?: string,
                funcionarios?: Funcionario[],
                corridas?: Corrida [],
                createDate?: Date,
                updateDate?: Date)
    {
        this.id = id!;
        this.nome = nome!;
        this.logradouro = logradouro!;
        this.cnpj = cnpj!;
        if (funcionarios) {
            this.funcionarios = funcionarios;
        }
        if (corridas) {
        this.corridas = corridas;
        }
        this.createDate = createDate!;
        this.updateDate = updateDate!;
    }

}