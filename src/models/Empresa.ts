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

    constructor(id: number, nome: string, funcionarios: Funcionario[], logradouro: Logradouro, corridas: Corrida[]) {
        this.id = id;
        this.nome = nome;
        this.funcionarios = funcionarios;
        this.logradouro = logradouro;
        this.corridas = corridas;
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