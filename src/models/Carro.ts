import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
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

    @Column({length: 20})
    cor: string;

    @Column({ unique: true })
    placa: string;

    @ManyToMany(() => Motorista, (motorista) => motorista.carros, {nullable: true})
    motoristas?: Motorista[];

    constructor(id?: number,
                marca?: string,
                modelo?: string,
                ano?: string,
                cor?:string,
                placa?: string,
                motoristas?: Motorista[]) {
        this.id = id!;
        this.marca = marca!;
        this.modelo = modelo!;
        this.ano = ano!;
        this.cor = cor!;
        this.placa = placa!;
        if(motoristas) {
        this.motoristas = motoristas;
        }
    }

}