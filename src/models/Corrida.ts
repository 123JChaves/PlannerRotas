import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Motorista } from "./Motorista";
import { Empresa } from "./Empresa";
import { Solicitacao } from "./Solicitacao";
import { Funcionario } from "./Funcionario";
import { RotaIda } from "./RotaIda";
import { RotaVolta } from "./RotaVolta";
import { Carro } from "./Carro";
import { Escala } from "./Escala";

@Entity("corrida")
export class Corrida {
    
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Motorista, motorista => motorista.corridas, { onDelete: "SET NULL", nullable: true })
    @JoinColumn({ name: "motoristaId" })
    motorista: Motorista | null;

    @ManyToOne(() => Carro, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "carroId" })
    carro?: Carro | null;

    @ManyToOne(() => Empresa, empresa => empresa.corridas, { onDelete: "SET NULL" })
    @JoinColumn({ name: "empresaId" })
    empresa: Empresa;

    // Adicionado "!" para silenciar o erro TS2564 e respeitar a regra do TypeORM
    @OneToMany(() => Solicitacao, solicitacao => solicitacao.corrida)
    solicitacoes!: Solicitacao[];

    @ManyToOne(() => Escala, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "escalaId" })
    escala?: Escala | null;

    // Adicionado "!" para silenciar o erro TS2564 e respeitar a regra do TypeORM
    @ManyToMany(() => Funcionario, funcionario => funcionario.corridas)
    @JoinTable({
        name: "funcionario_corridas",
        joinColumn: { name: "corridaId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "funcionarioId", referencedColumnName: "id" }
    })
    funcionarios!: Funcionario[];

    @Column({ type: "text", nullable: true })
    logNomesParticipantes?: string;

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
        rotaVolta?: RotaVolta | null,
        logNomesParticipantes?: string,
        escala?: Escala | null
    ) {
        this.id = id!;
        this.motorista = motorista || null;
        this.carro = carro;
        this.empresa = empresa!;
        
        if(solicitacoes) {
            this.solicitacoes = solicitacoes;
        }
        if(funcionarios) {
            this.funcionarios = funcionarios;
        }
        
        this.rotaIda = rotaIda;
        this.rotaVolta = rotaVolta;
        this.inicioDaCorrida = new Date();
        if (logNomesParticipantes) {
            this.logNomesParticipantes = logNomesParticipantes;
        }
        this.escala = escala;
    }
}