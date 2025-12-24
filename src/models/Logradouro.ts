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

    @Column({ type: "decimal", precision: 10, scale: 8, nullable: true })
    latitude?: number;

    @Column({ type: "decimal", precision: 11, scale: 8, nullable: true })
    longitude?: number;

    @OneToMany(() => Funcionario, funcionario => funcionario.logradouro)
    funcionarios?: Funcionario[];

    @OneToMany(() => Empresa, empresa => empresa.logradouro)
    empresas?: Empresa[];

    constructor(id?: number,
                nome?: string,
                numero?: number,
                bairro?: Bairro,
                latitude?: number,
                longitude?: number,
                empresas?: Empresa[],
                funcionarios?: Funcionario[]) {
        this.id = id!;
        this.nome = nome!;
        this.numero = numero!;
        this.bairro = bairro!;
        this.latitude = latitude;
        this.longitude = longitude;
        if(funcionarios) {
        this.funcionarios = funcionarios;
        }
        if(empresas) {
        this.empresas = empresas;
        }
    }
}