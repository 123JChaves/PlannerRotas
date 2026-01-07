import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { EscalaMotorista } from "./EscalaMotorista";

@Entity("escala")
@Unique(["data", "tipoRota"]) // Permite uma IDA e uma VOLTA por dia, mas não duas IDAs.
export class Escala {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' }) // Removido o unique daqui
    data: string;

    @Column({
        type: "enum",
        enum: ["IDA", "VOLTA"],
        default: "IDA"
    })
    tipoRota: "IDA" | "VOLTA";

    @OneToMany(() => EscalaMotorista, escalaMotorista => escalaMotorista.escala, { 
        cascade: true, 
        eager: true 
    })
    motoristasOrdem!: EscalaMotorista[];

    constructor(
        id?: number,
        data?: string,
        motoristasOrdem?: EscalaMotorista[],
        tipoRota?: "IDA" | "VOLTA"
    ) {
        this.id = id!;
        this.data = data!;
        this.tipoRota = tipoRota!;
        if(motoristasOrdem) {
        this.motoristasOrdem = motoristasOrdem
        }
    }
}