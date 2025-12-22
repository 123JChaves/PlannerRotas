import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Motorista } from "./Motorista";
import { Funcionario } from "./Funcionario";
import { Empresa } from "./Empresa";
import { RotaIda } from "./RotaIda";
import { RotaVolta } from "./RotaVolta";

@Entity("corrida")
export class Corrida {
    
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Motorista, (motorista) => motorista.corridas)
    @JoinColumn({ name: "motoristaId" })
    motorista: Motorista;

    @ManyToOne(() => Empresa, (empresa) => empresa.corridas, { onDelete: "SET NULL" })
    @JoinColumn({ name: "empresaId" })
    empresa: Empresa;

    @ManyToMany(() => Funcionario, funcionario => funcionario.corridas)
    funcionarios: Funcionario[];

    @OneToOne(() => RotaIda, (rotaIda) => rotaIda.corrida, { nullable: true })
    @JoinColumn({ name: "rotaIdaId" })
    rotaIda?: RotaIda;

    @OneToOne(() => RotaVolta, (rotaVolta) => rotaVolta.corrida, { nullable: true })
    @JoinColumn({ name: "rotaVoltaId" })
    rotaVolta?: RotaVolta;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    inicioDaCorrida: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    fimDaCorrida: Date;

    constructor(
        id?: number,
        motorista?: Motorista,
        empresa?: Empresa,
        funcionarios?: Funcionario[],
        inicioDaCorrida?: Date,
        fimDaCorrida?: Date,
        rotaIda?: RotaIda,
        rotaVolta?: RotaVolta
    ) {
        this.id = id!;
        this.motorista = motorista!;
        this.empresa = empresa!;
        this.funcionarios = funcionarios!;
        this.inicioDaCorrida = inicioDaCorrida!;
        this.fimDaCorrida = fimDaCorrida!;
        this.rotaIda = rotaIda;
        this.rotaVolta = rotaVolta;
    }
}