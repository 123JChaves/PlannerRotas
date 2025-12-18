import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Empresa } from "./Empresa";
import { Logradouro } from "./Logradouro";
import { Corrida } from "./Corrida";

@Entity("funcionario")
export class Funcionario {
    
    @PrimaryGeneratedColumn()
    private id: number;

    @Column()
    private nome: string;

    @ManyToOne(() => Empresa, empresa => empresa.getFuncionarios)
    private empresa: Empresa;

    @ManyToOne(() => Logradouro, logradouro => logradouro.getFuncionarios)
    private logradouro: Logradouro;

    @ManyToOne(() => Corrida, corrida => corrida.getFuncionarios)
    @JoinColumn({ name: "corridaId" })
    corrida: Corrida;

    constructor(id: number, nome: string, empresa: Empresa, logradouro: Logradouro, corrida: Corrida) {
        this.id = id;
        this.nome = nome;
        this.empresa = empresa;
        this.logradouro = logradouro;
        this.corrida = corrida;
    }

    public getEmpresa(): Empresa {
        return this.empresa;
    }

    public getLogradouro(): Logradouro {
        return this.logradouro;
    }

    public getCorrida(): Corrida {
        return this.corrida;
    }
}

