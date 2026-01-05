import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Motorista } from "./Motorista";
import { Categoria } from "./Categoria";

@Entity("carro")
export class Carro{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    marca: string;

    @Column()
    modelo: string;

    @Column()
    ano: string;

    @Column({length: 20})
    cor: string;

    @Column({ unique: true })
    placa: string;

    @ManyToMany(() => Categoria, (categoria) => categoria.carros, {eager: true})
    @JoinTable({
        name: "carro_categorias_categoria", // Tabela intermediária
        joinColumn: { name: "carroId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "categoriaId", referencedColumnName: "id" }
    })
    categorias?: Categoria[];

    @ManyToMany(() => Motorista, motorista => motorista.carros, {nullable: true})
    motoristas?: Motorista[];

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createDate?: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP" })
    updateDate?: Date;

    constructor(id?: number,
                marca?: string,
                modelo?: string,
                ano?: string,
                cor?:string,
                placa?: string,
                categorias?: Categoria[],
                motoristas?: Motorista[],
                createDate?: Date,
                updateDate?: Date) {
        this.id = id!;
        this.marca = marca!;
        this.modelo = modelo!;
        this.ano = ano!;
        this.cor = cor!;
        this.placa = placa!;
        if(categorias) {
            this.categorias = categorias;
        }
        if(motoristas) {
            this.motoristas = motoristas;
        }
        this.createDate = createDate;
        this.updateDate = updateDate;
    }

}