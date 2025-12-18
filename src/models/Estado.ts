import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Pais } from './Pais';
import { Cidade } from './Cidade';

@Entity()
export class Estado {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @ManyToOne(() => Pais, pais => pais.estados, {cascade: true})
    pais: Pais;

    @OneToMany(() => Cidade, cidade => cidade.estado)
    cidades?: Cidade[];

    constructor(id?: number,
                nome?: string,
                pais?: Pais,
                cidades?: Cidade[]) {
        this.id = id!;
        this.nome = nome!;
        this.pais = pais!;
        if(cidades) {
        this.cidades = cidades;
        }
    }
}