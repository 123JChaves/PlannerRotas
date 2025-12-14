import { Column, Entity, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Bairro } from "./Bairro";

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

    constructor(id: number, nome: string, numero: number, bairro: Bairro) {
        this.id = id;
        this.nome = nome;
        this.numero = numero;
        this.bairro = bairro;
    }

    public getBairro(): Bairro {
        return this.bairro;
    }
    
}
