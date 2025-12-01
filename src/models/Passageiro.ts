import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EnderecoResidencia } from './EnderecoResidencia';
import { Pessoa } from "./Pessoa";

@Entity('passageiro')
export class Passageiro implements Pessoa, EnderecoResidencia {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @Column()
    logradouroResidencia: string

    @Column()
    numeroResidencia: number;


    constructor(id: number, nome: string, logradouroResidencia: string, numeroResidencia: number) {
        this.id = id;
        this.nome = nome;
        this.logradouroResidencia = logradouroResidencia
        this.numeroResidencia = numeroResidencia
    }

    getName() {
        return this.nome
    }


}