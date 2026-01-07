import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Carro } from "./Carro";
import { Corrida } from "./Corrida";
import { Pessoa } from "./Pessoa";

@Entity("motorista")
export class Motorista {
    
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Pessoa, { cascade: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "pessoaId" })
    pessoa?: Pessoa;

    @Column()
    pessoaId?: number;

    @ManyToMany(() => Carro, carro => carro.motoristas, { 
        cascade: ["insert", "update"], // Evita que o TypeORM tente deletar o Carro ao deletar o Motorista
        eager: true,
        nullable: true
    })
    @JoinTable({
        name: "motorista_carros",
        joinColumn: {
            name: "motoristaId",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "carroId",
            referencedColumnName: "id"
        }
    })
    carros?: Carro[] | null;

    @Column({ nullable: true })
    carroAtualId?: number | null;

    // Opcional: Criar uma relação ManyToOne para acessar os dados do carro atual facilmente
    @ManyToOne(() => Carro, {eager: true, nullable: true})
    @JoinColumn({ name: "carroAtualId" })
    carroAtual?: Carro | null;

    @OneToMany(() => Corrida, corrida => corrida.motorista, {nullable: true})
    corridas?: Corrida[];

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createDate: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP" })
    updateDate: Date;

    constructor(id?: number,
                pessoa?: Pessoa,
                pessoaId?: number,
                carros?: Carro[] | null,
                carroAtualId?: number | null,
                carroAtual?: Carro | null,
                corridas?: Corrida[],
                createDate?: Date,
                updateDate?: Date) {
        this.id = id!;
        this.pessoa = pessoa;
        this.pessoaId = pessoaId;
        if(carros) {
        this.carros = carros;
        }
        this.carroAtualId = carroAtualId;
        this.carroAtual = carroAtual;
        if(corridas) {
        this.corridas = corridas;
        }
        this.createDate = createDate!;
        this.updateDate = updateDate!;
    }
}