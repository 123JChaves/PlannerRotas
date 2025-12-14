import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Estado } from './Estado';

@Entity()
export class Pais {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @OneToMany(() => Estado, estado => estado.getPais)
    estados: Estado[];

    constructor(id: number, nome: string, estados: Estado[]) {
        this.id = id;
        this.nome = nome;
        this.estados = estados;
    }

    getEstados(): Estado[] {
        return this.estados;
    }
}