import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Escala {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    data: string; // Ex: "2025-12-23"

    // Guardaremos a ordem exata da seleção manual
    @Column("simple-array")
    motoristaIds: number[];

    constructor(id: number, data: string, motoristaIds: number[]) {
        this.id = id;
        this.data = data;
        this.motoristaIds = motoristaIds;
    }
}