import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Cidade } from "./Cidade";
import { Logradouro } from "./Logradouro";

@Entity()
export class Bairro {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @ManyToOne(() => Cidade, cidade => cidade.bairros, {cascade: true})
    cidade: Cidade;

    @OneToMany(() => Logradouro, logradouro => logradouro.bairro)
    logradouros?: Logradouro[];

    constructor(id?: number,
                nome?: string,
                cidade?: Cidade,
                logradouros?: Logradouro[]) {
        this.id = id!;
        this.nome = nome!;
        this.cidade = cidade!;
        if(logradouros) {
        this.logradouros = logradouros;
        }
    }

}