import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EnderecoEmpresa } from './EnderecoEmpresa';
import { Pessoa } from './Pessoa';

@Entity()
export class Empresa implements EnderecoEmpresa, Pessoa {

    @PrimaryGeneratedColumn()
    private id: number;

    @Column()
    nome: string;

    @Column()
    logradouroEmpresa: string;

    @Column()
    numeroEmpresa: number;

    constructor(id: number, nome: string, logradouroEmpresa: string, numeroEmpresa: number) {
        this.id = id;
        this.nome = nome;
        this.logradouroEmpresa = logradouroEmpresa;
        this.numeroEmpresa = numeroEmpresa;
    }

    getIdEmpresa(): number {
        return this.id;
    }

    getName() {
        return this.nome
    }

}