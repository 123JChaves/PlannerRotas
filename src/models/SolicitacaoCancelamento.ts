import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Solicitacao } from "./Solicitacao";

@Entity("solicitacao_cancelamento")
export class SolicitacaoCancelamento {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "text" })
    motivo!: string;

    @Column({ type: "varchar", nullable: true })
    nomeFuncionarioSnapshot!: string; 

    // Alterado para CreateDateColumn para preenchimento automático em 2026
    @CreateDateColumn()
    dataCancelamento!: Date;

    @OneToOne(() => Solicitacao, { onDelete: "CASCADE" })
    @JoinColumn({ name: "solicitacaoId" })
    solicitacao!: Solicitacao;

    constructor(
        id?: number,
        motivo?: string,
        nomeFuncionarioSnapshot?: string,
        solicitacao?: Solicitacao
    ) {
        // Correção: o id deve ser atribuído sem a asserção '!' no valor se for opcional no constructor
        if (id) this.id = id;
        if (motivo) this.motivo = motivo;
        if (nomeFuncionarioSnapshot) this.nomeFuncionarioSnapshot = nomeFuncionarioSnapshot;
        if (solicitacao) this.solicitacao = solicitacao;
    }
}