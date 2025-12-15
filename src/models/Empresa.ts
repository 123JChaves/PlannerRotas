import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Funcionario } from "./Funcionario";
import { Logradouro } from "./Logradouro";

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

    constructor(id: number, nome: string, funcionarios: Funcionario[], logradouro: Logradouro) {
        this.id = id;
        this.nome = nome;
        this.funcionarios = funcionarios;
        this.logradouro = logradouro;
    }

    public getFuncionarios(): Funcionario[] {
        return this.funcionarios;
    }

    public getLogradouro() {
        return this.logradouro;
    }
}