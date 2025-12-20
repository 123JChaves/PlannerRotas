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

    // Relacionamento com Motorista (Dono da FK motoristaId)
    @ManyToOne(() => Motorista, (motorista) => motorista.corridas)
    @JoinColumn({ name: "motoristaId" })
    motorista: Motorista;

    // Relacionamento com Empresa (Dono da FK empresaId)
    @ManyToOne(() => Empresa, (empresa) => empresa.corridas, { onDelete: "SET NULL" })
    @JoinColumn({ name: "empresaId" })
    empresa: Empresa;

    // Relacionamento com Funcionários (A FK corridaId está na tabela Funcionario)
    @ManyToMany(() => Funcionario, funcionario => funcionario.corridas)
    funcionarios: Funcionario[];

    // Relacionamento com RotaIda (Dono da FK rotaIdaId)
    // nullable: true permite que a corrida seja criada sem uma rota de ida inicial
    @OneToOne(() => RotaIda, (rotaIda) => rotaIda.corrida, { nullable: true })
    @JoinColumn({ name: "rotaIdaId" })
    rotaIda?: RotaIda;

    // Relacionamento com RotaVolta (Dono da FK rotaVoltaId)
    @OneToOne(() => RotaVolta, (rotaVolta) => rotaVolta.corrida, { nullable: true })
    @JoinColumn({ name: "rotaVoltaId" })
    rotaVolta?: RotaVolta;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    inicioDaCorrida: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    fimDaCorrida: Date;

    // Construtor:
    // 1. Parâmetros com "?" tornam a instanciação flexível para o TypeORM e para o programador.
    // 2. Operador "!" (non-null assertion) para propriedades obrigatórias.
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