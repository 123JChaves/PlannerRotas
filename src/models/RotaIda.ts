import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Empresa } from "./Empresa";
import { Funcionario } from "./Funcionario";
import { Logradouro } from "./Logradouro";
import { Rota } from "./Rota";
import { Corrida } from "./Corrida";

@Entity("rota_ida")
export class RotaIda extends Rota {

    @PrimaryGeneratedColumn()
    private id: number;

    @OneToOne(() => Corrida, corrida => corrida.getRotaIda)
    corrida: Corrida;

    constructor(id: number, funcionarios: Funcionario[], empresa: Empresa, corrida: Corrida) {
        super(funcionarios, empresa);
        this.id = id;
        this.corrida = corrida;
    }

    public getCorrida(): Corrida {
        return this.corrida;
    }

    public getFuncionarios(): Funcionario[] {
        return super.getFuncionarios();
    }

    public getEmpresa(): Empresa {
        return super.getEmpresa();
    }

    public getEnderecosFuncionarios(): Logradouro[] {
        return this.getFuncionarios().map(funcionario => funcionario.getLogradouro());
    }

    public getDestino(): Logradouro {
        return this.getEmpresa().getLogradouro();
    }

    public adicionarFuncionario(funcionario: Funcionario): void {
    if (this.getFuncionarios().length >= 4) {
            throw new Error("A rota de ida já está com 4 funcionários");
        }
        if (funcionario.getLogradouro()) {
            super.adicionarFuncionario(funcionario);
        }
    }

    public removerFuncionario(funcionario: Funcionario): void {
    const index = this.getFuncionarios().indexOf(funcionario);
    if (index !== -1) {
        super.removerFuncionario(funcionario);
        }
    }

    public estaCheia(): boolean {
        return this.getFuncionarios().length >= 4;
    }
}