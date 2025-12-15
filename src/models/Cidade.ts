import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Estado } from "./Estado";
import { Bairro } from "./Bairro";

@Entity('cidade')
export class Cidade {

    @PrimaryGeneratedColumn()
    private id: number;

    @Column()
    private nome: string;

    @ManyToOne(() => Estado, estado => estado.getCidades)
    private estado: Estado;

    @OneToMany(() => Bairro, bairro => bairro.getCidade)
    private bairros: Bairro[];

    constructor(id: number, nome: string, estado: Estado, bairros: Bairro[]) {
        this.id = id;
        this.nome = nome;
        this.estado = estado;
        this.bairros = bairros;
    }

    public getNome() {
        return this.nome;
    }

    public getEstado(): Estado {
        return this.estado;
    }

    public getBairros(): Bairro[] {
        return this.bairros;
    }
}