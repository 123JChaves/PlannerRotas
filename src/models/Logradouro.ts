import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Bairro } from "./Bairro";
import { Empresa } from "./Empresa";
import { Funcionario } from "./Funcionario";

@Entity("logradouro")
export class Logradouro {

    @PrimaryGeneratedColumn()
    private id: number;

    @Column()
    private nome: string;

    @Column()
    private numero: number;

    @ManyToOne(() => Bairro, bairro => bairro.getLogradouros)
    private bairro: Bairro;

    @OneToMany(() => Funcionario, funcionario => funcionario.getLogradouro)
    private funcionarios: Funcionario[];

    @OneToMany(() => Empresa, empresa => empresa.getLogradouro)
    private empresas: Empresa[];

    constructor(id: number, nome: string, numero: number, bairro: Bairro, empresas: Empresa[], funcionarios: Funcionario[]) {
        this.id = id;
        this.nome = nome;
        this.numero = numero;
        this.bairro = bairro;
        this.funcionarios = funcionarios;
        this.empresas = empresas;
    }

    public getBairro(): Bairro {
        return this.bairro;
    }

    public getFuncionarios(): Funcionario[] {
        return this.funcionarios;
    }

    public getEmpresas(): Empresa[] {
        return this.empresas;
    }
}