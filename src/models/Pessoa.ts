import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("pessoa")
export class Pessoa {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    cpf: string;

    @Column()
    nome: string;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;

    constructor(id?: number,
                cpf?: string,
                nome?: string,
                createDate?: Date,
                updateDate?: Date

    ) {
        this.id = id!;
        this.cpf = cpf!;
        this.nome = nome!;
        this.createDate = createDate!;
        this.updateDate = updateDate!;
    }
}