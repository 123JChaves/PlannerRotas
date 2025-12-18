import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Estado } from "./Estado";
import { Bairro } from "./Bairro";

@Entity('cidade')
export class Cidade {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @ManyToOne(() => Estado, estado => estado.cidades, {cascade: true})
    estado: Estado;

    @OneToMany(() => Bairro, bairro => bairro.cidade)
    bairros?: Bairro[];

    constructor(id?: number,
                nome?: string,
                estado?: Estado,
                bairros?: Bairro[]) {
        this.id = id!;
        this.nome = nome!;
        this.estado = estado!;
        if(bairros) {
        this.bairros = bairros;
        }
    }
    
}