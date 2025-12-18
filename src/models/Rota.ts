import { Empresa } from "./Empresa";
import { Funcionario } from "./Funcionario";

export abstract class Rota {

    private funcionarios: Funcionario[];
    
    private empresa: Empresa;

    constructor(funcionarios: Funcionario[], empresa: Empresa) {
        
        this.funcionarios = funcionarios;
        this.empresa = empresa;
    }

    protected adicionarFuncionario(funcionario: Funcionario): void {
        this.funcionarios.push(funcionario);
    }

    protected removerFuncionario(funcionario: Funcionario): void {
        const index = this.funcionarios.indexOf(funcionario);
        if (index !== -1) {
            this.funcionarios.splice(index, 1);
        }
    }

    protected getFuncionarios(): Funcionario[] {
        return this.funcionarios;
    }

    protected getEmpresa(): Empresa {
        return this.empresa;
    }

    protected criarRotaIda(): void {

    }
}