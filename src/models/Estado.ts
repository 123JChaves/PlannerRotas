import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Pais } from './Pais';
import { Cidade } from './Cidade';

@Entity()
export class Estado {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @ManyToOne(() => Pais, pais => pais.estados)
    pais: Pais;

    @OneToMany(() => Cidade, cidade => cidade.getEstado)
    cidades: Cidade[];

    constructor(id: number, nome: string, pais: Pais, cidades: Cidade[]) {
        this.id = id;
        this.nome = nome;
        this.pais = pais;
        this.cidades = cidades;
    }

    public getPais() {
        return this.pais;
    }

    public getCidades(): Cidade[] {
        return this.cidades;
    }
}