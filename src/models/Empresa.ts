import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Funcionario } from "./Funcionario";
import { Logradouro } from "./Logradouro";
import { Corrida } from "./Corrida";

@Entity("empresa")
export class Empresa {

    @PrimaryGeneratedColumn()
    private id: number;

    @Column()
    private nome: string;

    @OneToMany(() => Funcionario, funcionario => funcionario.getEmpresa)
    private funcionarios: Funcionario[];

    @ManyToOne(() => Logradouro, logradouro => logradouro.getEmpresas)
    private logradouro: Logradouro;

    @OneToMany(() => Corrida, corrida => corrida.getEmpresa)
    corridas: Corrida[];

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createDate: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP" })
    updateDate: Date;

    constructor(id: number, nome: string, funcionarios: Funcionario[], logradouro: Logradouro, corridas: Corrida[], createDate: Date, updateDate: Date) {
        this.id = id;
        this.nome = nome;
        this.funcionarios = funcionarios;
        this.logradouro = logradouro;
        this.corridas = corridas;
        this.createDate = createDate;
        this.updateDate = updateDate;
    }

    public getId() {
        return this.id;
    }

    public getFuncionarios(): Funcionario[] {
        return this.funcionarios;
    }

    public getLogradouro(): Logradouro {
        return this.logradouro;
    }

    public getCorridas(): Corrida[] {
        return this.corridas;
    }
}