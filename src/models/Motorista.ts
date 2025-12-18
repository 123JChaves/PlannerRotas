import { Column, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Carro } from "./Carro";
import { Corrida } from "./Corrida";

@Entity("motorista")
export class Motorista {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @OneToMany(() => Carro, (carro) => carro.motorista)
    carros?: Carro[];

    @OneToOne(() => Corrida, (corrida) => corrida.motorista)
    corrida?: Corrida;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createDate: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP" })
    updateDate: Date;

    constructor(id?: number,
                nome?: string,
                carros?: Carro[],
                corrida?: Corrida,
                createDate?: Date,
                updateDate?: Date) {
        this.id = id!;
        this.nome = nome!;
        if(carros) {
        this.carros = carros;
        }
        this.corrida = corrida;
        this.createDate = createDate!;
        this.updateDate = updateDate!;
    }
}