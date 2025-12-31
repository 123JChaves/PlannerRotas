import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Carro } from "./Carro";

@Entity("categoria")
export class Categoria {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    categoria: string;

    @Column({default: false})
    ativa: boolean;

    @ManyToMany(() => Carro, carro => carro.categorias, { cascade: true })
    carros?: Carro[];

    constructor(id?: number, 
                categoria?: string, 
                ativa?: boolean, 
                carros?: Carro[]) {
                    this.id = id!;
                    this.categoria = categoria!;
                    this.ativa = ativa!;
                    if(carros) {
                    this.carros = carros;
                    }
                }
}