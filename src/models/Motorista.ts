import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Carro } from "./Carro";

@Entity("motorista")
export class Motorista {

    @PrimaryGeneratedColumn()
    private id: number;

    @Column()
    private nome: string;

    @OneToMany(() => Carro, carro => carro.getMotorista)
    carros: Carro[];

    constructor(id: number, nome: string, carros: Carro[]) {
        this.id = id;
        this.nome = nome;
        this.carros = carros;
    }

    public getCarros(): Carro[] {
        return this.carros;
    }
}