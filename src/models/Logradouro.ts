import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Bairro } from "./Bairro";
import { Empresa } from "./Empresa";
import { Funcionario } from "./Funcionario";

@Entity("logradouro")
export class Logradouro {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @Column()
    numero: number;

    @ManyToOne(() => Bairro, bairro => bairro.logradouros, {cascade: true})
    bairro: Bairro;

    @OneToMany(() => Funcionario, funcionario => funcionario.logradouro)
    funcionarios?: Funcionario[];

    @OneToMany(() => Empresa, empresa => empresa.logradouro)
    empresas?: Empresa[];

    constructor(id?: number,
                nome?: string,
                numero?: number,
                bairro?: Bairro,
                empresas?: Empresa[],
                funcionarios?: Funcionario[]) {
        this.id = id!;
        this.nome = nome!;
        this.numero = numero!;
        this.bairro = bairro!;
        if(funcionarios) {
        this.funcionarios = funcionarios;
        }
        if(empresas) {
        this.empresas = empresas;
        }
    }
}