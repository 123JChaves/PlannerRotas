import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { Escala } from "./Escala";
import { Motorista } from "./Motorista";

@Entity("escala_motorista")
export class EscalaMotorista {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ type: 'int' })
    ordem?: number; // 0, 1, 2, 3... define a sequência manual

    @ManyToOne(() => Escala, (escala) => escala.motoristasOrdem, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "escalaId" })
    escala?: Escala;

    @ManyToOne(() => Motorista, { eager: true })
    @JoinColumn({ name: "motoristaId" })
    motorista?: Motorista;

    constructor(ordem?: number, escala?: Escala, motorista?: Motorista, id?: number) {
        if(id) this.id = id;
        if(ordem !== undefined) this.ordem = ordem;
        if(escala) this.escala = escala;
        if(motorista) this.motorista = motorista;
    }
}
