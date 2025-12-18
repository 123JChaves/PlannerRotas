import { Column, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Carro } from "./Carro";
import { Corrida } from "./Corrida";

@Entity("motorista")
export class Motorista {
    
    @PrimaryGeneratedColumn()
    private id: number;

    @Column()
    private nome: string;

    @OneToMany(() => Carro, (carro) => carro.getMotorista)
    carros: Carro[];

    @OneToOne(() => Corrida, (corrida) => corrida.getMotorista)
    corrida: Corrida;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createDate: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP" })
    updateDate: Date;

    constructor(id: number, nome: string, carros: Carro[], corrida: Corrida, createDate: Date, updateDate: Date) {
        this.id = id;
        this.nome = nome;
        this.carros = carros;
        this.corrida = corrida;
        this.createDate = createDate;
        this.updateDate = updateDate;
    }

    public getCarros(): Carro[] {
        return this.carros;
    }

    public getCorrida(): Corrida {
        return this.corrida;
    }
}