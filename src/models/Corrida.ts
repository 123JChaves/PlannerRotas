import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Empresa } from "./Empresa";
import { Motorista } from "./Motorista";
import { Passageiro } from "./Passageiro";

@Entity()
export class Corrida {
    
    @PrimaryGeneratedColumn()
    private id: number;

    @OneToMany(() => Empresa, empresa => empresa.getIdEmpresa())
    private empresa: Empresa;

    @OneToMany(() => Motorista, motorista => motorista.id)
    private motorista: Motorista;

    @OneToMany(() => Passageiro, passageiro => passageiro.id)
    private passageiro: Passageiro;

    constructor(id: number, empresa: Empresa, motorista: Motorista, passageiro: Passageiro) {
        this.id = id;
        this.empresa = empresa;
        this.motorista = motorista;
        this.passageiro = passageiro;
    }
}