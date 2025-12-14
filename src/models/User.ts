import { Column, Entity, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({unique: true})
  email: string;

  @Column()
  senha: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createDate: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP",
  onUpdate: "CURRENT_TIMESTAMP" })
  updateDate: Date;

  constructor(id: number, nome: string, email: string, senha: string, createDate: Date, updateDate: Date) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.createDate = createDate;
    this.updateDate = updateDate
  }

  getNome() {
        return this.nome
  };

  @BeforeInsert()
  async hashSenhaInsert() {
    this.senha = await bcrypt.hash(this.senha, 10);
  };

  @BeforeUpdate()
  async hashSenhaUpdate() {
    if(this.senha) {
      this.senha = await bcrypt.hash(this.senha, 10);
    };
  };
}
