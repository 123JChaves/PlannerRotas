import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Cidade } from "./Cidade";
import { Logradouro } from "./Logradouro";

@Entity()
export class Bairro {

    @PrimaryGeneratedColumn()
    private id: number;

    @Column()
    private nome: string;

    @ManyToOne(() => Cidade, cidade => cidade.getBairros)
    private cidade: Cidade;

    @OneToMany(() => Logradouro, logradouro => logradouro.getBairro)
    private logradouros: Logradouro[];

    constructor(id: number, nome: string, cidade: Cidade, logradouros: Logradouro[]) {
        this.id = id;
        this.nome = nome;
        this.cidade = cidade;
        this.logradouros = logradouros;
    }

    public getCidade(): Cidade {
        return this.cidade;
    }

    public getLogradouros(): Logradouro[] {
        return this.logradouros;
    }

}