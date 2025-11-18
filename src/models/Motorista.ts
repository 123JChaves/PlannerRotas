import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Carro } from "./Carro";
import { Pessoa } from "./Pessoa";

@Entity()
export class Motorista implements Pessoa {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @Column()
    carro: Carro;

    constructor(id: number, nome: string, carro: Carro) {
        this.id = id;
        this.nome = nome;
        this.carro = carro;
    }

    getName() {
        return this.nome
    }

}