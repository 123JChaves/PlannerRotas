import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Motorista } from "./Motorista";
import { Empresa } from "./Empresa";
import { Solicitacao } from "./Solicitacao";
import { Funcionario } from "./Funcionario";
import { RotaIda } from "./RotaIda";
import { RotaVolta } from "./RotaVolta";
import { Carro } from "./Carro";

@Entity("corrida")
export class Corrida {
    
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Motorista, motorista => motorista.corridas)
    @JoinColumn({ name: "motoristaId" })
    motorista: Motorista;

    // NOVO: Registro imutável do carro usado nesta corrida específica
    @ManyToOne(() => Carro, {nullable: true})
    @JoinColumn({ name: "carroId" })
    carro?: Carro;

    @ManyToOne(() => Empresa, empresa => empresa.corridas, { onDelete: "SET NULL" })
    @JoinColumn({ name: "empresaId" })
    empresa: Empresa;

    @OneToMany(() => Solicitacao, solicitacao => solicitacao.corrida)
    solicitacoes: Solicitacao[];

    @ManyToMany(() => Funcionario, funcionario => funcionario.corridas)
    @JoinTable({
        name: "funcionario_corridas",
        joinColumn: { name: "corridaId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "funcionarioId", referencedColumnName: "id" }
    })
    funcionarios: Funcionario[];

    @OneToOne(() => RotaIda, rotaIda => rotaIda.corrida, { nullable: true, cascade: true })
    @JoinColumn({ name: "rotaIdaId" })
    rotaIda?: RotaIda | null;

    @OneToOne(() => RotaVolta, rotaVolta => rotaVolta.corrida, { nullable: true, cascade: true })
    @JoinColumn({ name: "rotaVoltaId" })
    rotaVolta?: RotaVolta | null;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    inicioDaCorrida: Date;

    @Column({ type: "timestamp", nullable: true })
    fimDaCorrida?: Date;

    constructor(
        id?: number,
        motorista?: Motorista,
        carro?: Carro,
        empresa?: Empresa,
        solicitacoes?: Solicitacao[],
        funcionarios?: Funcionario[],
        rotaIda?: RotaIda | null,
        rotaVolta?: RotaVolta | null
    ) {
        this.id = id!;
        this.motorista = motorista!;
        this.carro = carro;
        this.empresa = empresa!;
        this.solicitacoes = solicitacoes!,
        this.funcionarios = funcionarios!;
        this.rotaIda = rotaIda;
        this.rotaVolta = rotaVolta;
        this.inicioDaCorrida = new Date();
    }
}