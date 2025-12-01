import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Empresa } from "./Empresa";
import { Motorista } from "./Motorista";
import { Passageiro } from "./Passageiro";

@Entity('corrida')
export class Corrida {
    
    @PrimaryGeneratedColumn()
    private id: number;

    @ManyToOne(() => Empresa, empresa => empresa.getIdEmpresa())
    private empresa: Empresa;

    @ManyToOne(() => Motorista, motorista => motorista.id)
    private motorista: Motorista;

    @ManyToOne(() => Passageiro, passageiro => passageiro.id)
    private passageiro: Passageiro;

    constructor(id: number, empresa: Empresa, motorista: Motorista, passageiro: Passageiro) {
        this.id = id;
        this.empresa = empresa;
        this.motorista = motorista;
        this.passageiro = passageiro;
    }
}
