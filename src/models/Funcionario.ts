import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Empresa } from "./Empresa";
import { Logradouro } from "./Logradouro";

@Entity()
export class Funcionario {
    @PrimaryGeneratedColumn()
    private id: number;

    @Column()
    private nome: string;

    @ManyToOne(() => Empresa, empresa => empresa.getFuncionarios)
    private empresa: Empresa;

    @ManyToOne(() => Logradouro, logradouro => logradouro.getFuncionarios)
    private logradouro: Logradouro;

    constructor(id: number, nome: string, empresa: Empresa, logradouro: Logradouro) {
        this.id = id;
        this.nome = nome;
        this.empresa = empresa;
        this.logradouro = logradouro;
    }

    public getEmpresa() {
        return this.empresa;
    }

    public getLogradouro() {
        return this.logradouro;
    }
}

