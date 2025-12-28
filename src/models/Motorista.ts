import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Carro } from "./Carro";
import { Corrida } from "./Corrida";

@Entity("motorista")
export class Motorista {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @Column({unique: true})
    cpf: string;

    @ManyToMany(() => Carro, carro => carro.motoristas, { cascade: true, eager: true })
    @JoinTable({
        name: "motorista_carros", // Nome da tabela intermediária
        joinColumn: { name: "motoristaId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "carroId", referencedColumnName: "id" }
    })
    carros?: Carro[];

    @Column({ nullable: true })
    carroAtualId?: number;


    // Opcional: Criar uma relação ManyToOne para acessar os dados do carro atual facilmente
    @ManyToOne(() => Carro)
    @JoinColumn({ name: "carroAtualId" })
    carroAtual?: Carro;

    @OneToMany(() => Corrida, corrida => corrida.motorista, {nullable: true})
    corridas?: Corrida[];

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createDate: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP" })
    updateDate: Date;

    constructor(id?: number,
                nome?: string,
                cpf?: string,
                carros?: Carro[],
                carroAtualId?: number,
                carroAtual?: Carro,
                corridas?: Corrida[],
                createDate?: Date,
                updateDate?: Date) {
        this.id = id!;
        this.nome = nome!;
        this.cpf = cpf!;
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