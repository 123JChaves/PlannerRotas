import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Empresa } from "./Empresa";
import { Logradouro } from "./Logradouro";
import { Corrida } from "./Corrida";
import { Pessoa } from "./Pessoa";
import { Solicitacao } from "./Solicitacao";

@Entity("funcionario")
export class Funcionario {
    
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Pessoa, { 
        cascade: ["insert", "update", "remove"], 
        onDelete: "CASCADE"          
    })
    @JoinColumn({ name: "pessoaId" })
    pessoa?: Pessoa;

    @Column()
    pessoaId?: number;

    @ManyToOne(() => Empresa, empresa => empresa.funcionarios, { onDelete: "SET NULL" })
    @JoinColumn({ name: "empresaId" })
    empresa: Empresa;

    @ManyToOne(() => Logradouro, logradouro => logradouro.funcionarios, { cascade: true })
    @JoinColumn({ name: "logradouroId" })
    logradouro: Logradouro;

    @ManyToMany(() => Corrida, (corrida) => corrida.funcionarios)
    corridas?: Corrida[];

    // Usamos o '?' para indicar que pode ser indefinido até que seja carregado via relations
    @OneToMany(() => Solicitacao, solicitacao => solicitacao.funcionario)
    solicitacoes?: Solicitacao[];

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createDate: Date;
    
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updateDate: Date;

    constructor(id?: number,
                pessoa?: Pessoa,
                pessoaId?: number,
                empresa?: Empresa,
                logradouro?: Logradouro,
                corridas?: Corrida[],
                solicitacoes?: Solicitacao[],
                createDate?: Date,
                updateDate?: Date) {
        this.id = id!;
        this.pessoa = pessoa;
        this.pessoaId = pessoaId;
        this.empresa = empresa!;
        this.logradouro = logradouro!;
        this.corridas = corridas;
        this.solicitacoes = solicitacoes; // Agora o TS aceita pois ambos são opcionais
        this.createDate = createDate!;
        this.updateDate = updateDate!;
    }
}