import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Motorista } from "./Motorista";
import { Empresa } from "./Empresa";
import { Solicitacao } from "./Solicitacao";
import { Funcionario } from "./Funcionario";
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

    // CORREÇÃO: OneToMany não usa JoinColumn e deve ser um array []
    @OneToMany(() => Solicitacao, (solicitacao) => solicitacao.corrida)
    solicitacoes: Solicitacao[]; 

    @ManyToMany(() => Funcionario, funcionario => funcionario.corridas)
    @JoinTable({
        name: "funcionario_corridas", // Nome exato da sua tabela no banco
        joinColumn: { name: "corridaId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "funcionarioId", referencedColumnName: "id" }
    })
    funcionarios: Funcionario[];

    @OneToOne(() => RotaIda, (rotaIda) => rotaIda.corrida, { nullable: true, cascade: true })
    @JoinColumn({ name: "rotaIdaId" })
    rotaIda?: RotaIda | null;

    @OneToOne(() => RotaVolta, (rotaVolta) => rotaVolta.corrida, { nullable: true, cascade: true })
    @JoinColumn({ name: "rotaVoltaId" })
    rotaVolta?: RotaVolta | null;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    inicioDaCorrida: Date;

    @Column({ type: "timestamp", nullable: true })
    fimDaCorrida?: Date;

    constructor(
        id?: number,
        motorista?: Motorista,
        empresa?: Empresa,
        solicitacoes?: Solicitacao[], // Alterado para array
        funcionarios?: Funcionario[],
        rotaIda?: RotaIda | null,
        rotaVolta?: RotaVolta | null
    ) {
        this.id = id!;
        this.motorista = motorista!;
        this.empresa = empresa!;
        this.solicitacoes = solicitacoes!;
        this.funcionarios = funcionarios!;
        this.rotaIda = rotaIda;
        this.rotaVolta = rotaVolta;
        this.inicioDaCorrida = new Date();
    }
}