import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Pessoa } from './Pessoa';

@Entity()
export class User implements Pessoa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  email: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createDate: Date

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP",
  onUpdate: "CURRENT_TIMESTAMP" })
  updateDate: Date

  constructor(id: number, nome: string, email: string, createDate: Date, updateDate: Date) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.createDate = createDate;
    this.updateDate = updateDate
  }

  getName() {
        return this.nome
    }

}
