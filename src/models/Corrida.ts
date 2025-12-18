import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Motorista } from "./Motorista";
import { Funcionario } from "./Funcionario";
import { Empresa } from "./Empresa";
import { RotaIda } from "./RotaIda";
import { RotaVolta } from "./RotaVolta";

@Entity("corrida")
export class Corrida {
    
    @PrimaryGeneratedColumn()
    private id: number;

    @OneToOne(() => Motorista, (motorista) => motorista.getCorrida)
    @JoinColumn({name: "motoristaId"})
    private motorista: Motorista;

    @ManyToOne(() => Empresa, (empresa) => empresa.getCorridas)
    @JoinColumn({name: "empresaId"})
    private empresa: Empresa;

    @OneToMany(() => Funcionario, (funcionario) => funcionario.getCorrida)
    private funcionarios: Funcionario[];

    @OneToOne(() => RotaIda, rotaIda => rotaIda.getCorrida)
    @JoinColumn({name: "rotaIdaId"})
    private rotaIda: RotaIda;

    @OneToOne(() => RotaVolta, rotaVolta => rotaVolta.getCorrida)
    @JoinColumn({name: "rotaVoltaId"})
    private rotaVolta: RotaVolta;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    private inicioDaCorrida: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    private fimDaCorrida: Date;

    constructor(
        id: number,
        motorista: Motorista,
        empresa: Empresa,
        funcionarios: Funcionario[],
        inicioDaCorrida: Date,
        fimDaCorrida: Date,
        rotaIda: RotaIda,
        rotaVolta: RotaVolta
    ) {
        this.id = id;
        this.motorista = motorista;
        this.empresa = empresa;
        this.funcionarios = funcionarios;
        this.inicioDaCorrida = inicioDaCorrida;
        this.fimDaCorrida = fimDaCorrida;
        this.rotaIda = rotaIda;
        this.rotaVolta = rotaVolta;
    }

    public getMotorista(): Motorista {
        return this.motorista;
    }

    public getEmpresa(): Empresa {
        return this.empresa;
    }

    public getFuncionarios(): Funcionario[] {
        return this.funcionarios;
    }

    public getRotaIda(): RotaIda {
        return this.rotaIda;
    }

    public getRotaVolta(): RotaVolta {
        return this.rotaVolta;
    }

    public getInicioDaCorrida() {
        return this.inicioDaCorrida;
    }

    public getFimDaCorrida() {
        return this.fimDaCorrida;
    }
}