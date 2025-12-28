import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Rota } from "./Rota";
import { Corrida } from "./Corrida";
import { Funcionario } from "./Funcionario";
import { Empresa } from "./Empresa";
import { Logradouro } from "./Logradouro";


@Entity("rota_ida")
export class RotaIda extends Rota {
    
    @PrimaryGeneratedColumn()
    id!: number; // O '!' diz ao TS: "O TypeORM vai preencher isso, não se preocupe"

    @Column({ type: "text", nullable: true })
    ordemDasParadas?: string; 

    @Column({ type: "text", nullable: true })
    geoJsonRota?: string;

    @OneToOne(() => Corrida, corrida => corrida.rotaIda)
    corrida!: Corrida;

    constructor(
        id?: number, 
        ordemDasParadas?: string, 
        geoJsonRota?: string, 
        empresa?: Empresa, 
        funcionarios?: Funcionario[], 
        corrida?: Corrida
    ) {
        // Como Rota é abstrata, passamos os dados para o super dela
        super(funcionarios || [], empresa!); 
        
        if (id) this.id = id;
        if (ordemDasParadas) this.ordemDasParadas = ordemDasParadas;
        if (geoJsonRota) this.geoJsonRota = geoJsonRota;
        if (corrida) this.corrida = corrida;
    }

     // Método para facilitar a leitura
    public getOrdemArray(): number[] {
        return this.ordemDasParadas ? this.ordemDasParadas.split(',').map(Number) : [];
    }
}