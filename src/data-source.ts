import "reflect-metadata";
import { DataSource } from 'typeorm';
import { User } from "./models/User";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "123456",
    database: "plannerrotas",
    synchronize: true,
    logging: true,
    entities: [User],
    subscribers: [],
    migrations: [__dirname+"/migrations/*.js"],
})