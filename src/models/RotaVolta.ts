import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Empresa } from "./Empresa";
import { Funcionario } from "./Funcionario";
import { Logradouro } from "./Logradouro";
import { Rota } from "./Rota";
import { Corrida } from "./Corrida";

@Entity("rota_volta")
export class RotaVolta  extends Rota{

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Corrida, corrida => corrida.rotaVolta)
    corrida: Corrida;

    constructor(id: number, empresa: Empresa, funcionarios: Funcionario[], corrida: Corrida) {
        super(funcionarios, empresa);
        this.corrida = corrida;
        this.id = id;
    }

    public getEnderecosFuncionarios(): Logradouro[] {
        return this.funcionarios.map(funcionario => funcionario.logradouro);
    }

    public getEmbarque(): Logradouro {
        return this.empresa.logradouro;
    }

    public adicionarFuncionario(funcionario: Funcionario): void {
    if (this.funcionarios.length >= 4) {
            throw new Error("A rota de ida já está com 4 funcionários");
        }
        if (funcionario.logradouro) {
            super.adicionarFuncionario(funcionario);
        }
    }

    public removerFuncionario(funcionario: Funcionario): void {
    const index = this.funcionarios.indexOf(funcionario);
    if (index !== -1) {
        super.removerFuncionario(funcionario);
        }
    }

    public estaCheia(): boolean {
        return this.funcionarios.length >= 4;
    }
}