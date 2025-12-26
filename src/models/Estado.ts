import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Unique, JoinColumn } from 'typeorm';
import { Pais } from './Pais';
import { Cidade } from './Cidade';

@Entity("estado")
@Unique(["nome", "pais"])
export class Estado {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @ManyToOne(() => Pais, pais => pais.estados, {cascade: true})
    pais: Pais;

    @OneToMany(() => Cidade, cidade => cidade.estado)
    @JoinColumn({name: "paisId"})
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