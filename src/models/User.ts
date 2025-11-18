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

  constructor(id: number, nome: string, email: string) {
    this.id = id;
    this.nome = nome;
    this.email = email;
  }

  getName() {
        return this.nome
    }
    
}
