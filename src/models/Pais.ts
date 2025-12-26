import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from 'typeorm';
import { Estado } from './Estado';

@Entity("pais")
@Unique(["nome"]) 
export class Pais {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @OneToMany(() => Estado, estado => estado.pais)
    estados?: Estado[];

    constructor(id?: number,
                nome?: string,
                estados?: Estado[]) {
        this.id = id!;
        this.nome = nome!;
        if (estados) {
        this.estados = estados;
        }
    }

}