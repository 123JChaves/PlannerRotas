import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Motorista } from "./Motorista";

@Entity("carro")
export class Carro{

    @PrimaryGeneratedColumn()
    private id: number;

    @Column()
    private marca: string;

    @Column()
    private modelo: string;

    @Column()
    private ano: string;

    @ManyToOne(() => Motorista, motorista => motorista.getCarros)
    private motorista: Motorista;

    constructor(id: number, marca: string, modelo: string, ano: string, motorista: Motorista) {
        this.id = id;
        this.marca = marca;
        this.modelo = modelo;
        this.ano = ano;
        this.motorista = motorista;
    }

    public getMotorista(): Motorista {
        return this.motorista;
    }

}