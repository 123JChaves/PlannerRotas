import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Carro {
    @PrimaryGeneratedColumn()
    private id: number

    @Column()
    private marca: string

    @Column()
    private modelo: string

    @Column()
    private ano: number

    constructor(id: number, marca: string, modelo: string, ano: number) {
        this.id = id;
        this.marca = marca;
        this.modelo = modelo;
        this.ano = ano;
    }
}