import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Motorista } from "./Motorista";

@Entity("carro")
export class Carro{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    marca: string;

    @Column()
    modelo: string;

    @Column()
    ano: string;

    // @Column()
    // placa: string;

    @ManyToOne(() => Motorista, motorista => motorista.carros, { nullable: true })
    motorista?: Motorista;

    constructor(id?: number,
                marca?: string,
                modelo?: string,
                ano?: string,
                placa?: string,
                motorista?: Motorista) {
        this.id = id!;
        this.marca = marca!;
        this.modelo = modelo!;
        this.ano = ano!;
        //this.placa = placa!;
        this.motorista = motorista;
    }

}