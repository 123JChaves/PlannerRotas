import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Empresa } from "./Empresa";
import { Funcionario } from "./Funcionario";
import { Logradouro } from "./Logradouro";
import { Rota } from "./Rota";
import { Corrida } from "./Corrida";

@Entity("rota_volta")
export class RotaVolta  extends Rota{

    @PrimaryGeneratedColumn()
    id!: number;
    
    @Column({ type: "text", nullable: true })
    ordemDasParadas?: string; 
    
    // Otimização: Armazena o JSON da rota do Mapbox para reconstruir o mapa no front
    @Column({ type: "text", nullable: true })
    geoJsonRota?: string;

    @OneToOne(() => Corrida, corrida => corrida.rotaVolta)
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