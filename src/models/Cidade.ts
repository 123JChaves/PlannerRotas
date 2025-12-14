import { Column, Entity, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Estado } from "./Estado";
import { Bairro } from "./Bairro";
import { Logradouro } from "./Logradouro";

@Entity('cidade')
export class Cidade {

    @PrimaryGeneratedColumn()
    private id: number;

    @Column()
    private nome: string;

    @ManyToOne(() => Estado, estado => estado.getCidades)
    private estado: Estado;

    @ManyToOne(() => Bairro, bairro => bairro.getCidade)
    bairros: Bairro[];

    constructor(id: number, nome: string, estado: Estado, bairros: Bairro[]) {
        this.id = id;
        this.nome = nome;
        this.estado = estado;
        this.bairros = bairros;
    }

    public getEstado(): Estado {
        return this.estado;
    }

    public getBairros(): Bairro[] {
        return this.bairros;
    }
}