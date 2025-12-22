import "reflect-metadata";
import { DataSource } from 'typeorm';
import { User } from "./models/User";
import { Pais } from "./models/Pais";
import { Estado } from "./models/Estado";
import { Cidade } from "./models/Cidade";
import { Bairro } from "./models/Bairro";
import { Logradouro } from "./models/Logradouro";
import { Motorista } from "./models/Motorista";
import { Carro } from "./models/Carro";
import { Empresa } from "./models/Empresa";
import { Funcionario } from "./models/Funcionario";
import { Corrida } from "./models/Corrida";
import { RotaIda } from "./models/RotaIda";
import { RotaVolta } from "./models/RotaVolta";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "plannerrotas",
    synchronize: true,
    logging: true,
    entities: [User, Pais, Estado, Cidade, Bairro, Logradouro, Motorista,
    Carro, Empresa, Funcionario, Corrida, RotaIda, RotaVolta],

    subscribers: [],
    migrations: [__dirname+"/migrations/*.js"],
});

AppDataSource.initialize()
.then(() => {
    console.log("Conexão com o banco de dados realizada com sucesso!");
}).catch((error) => {
    console.log("Erro ao conectar com o banco de dados", error);
});