// import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

// export class CreateRotaVoltaTableAndRotaVoltaFuncionarios1765916353999 implements MigrationInterface {

//     public async up(queryRunner: QueryRunner): Promise<void> {

//         await queryRunner.createTable(new Table({
//             name: "rota_volta",
//             columns: [
//                 {
//                 name: "id",
//                 type: "int",
//                 isPrimary: true,
//                 isGenerated: true,
//                 generationStrategy: "increment",
//                 },
//                 {
//                 name: "empresaId",
//                 type: "int",
//                 },
//                 {
//                 name: "corridaId",
//                 type: "int",
//                 },
//             ],
//         }));

//         await queryRunner.createForeignKey("rota_volta", new TableForeignKey({
//         columnNames: ["empresaId"],
//         referencedColumnNames: ["id"],
//         referencedTableName: "empresa",
//         onDelete: "CASCADE",
//         }));

//         await queryRunner.createForeignKey("rota_volta", new TableForeignKey({
//         columnNames: ["corridaId"],
//         referencedColumnNames: ["id"],
//         referencedTableName: "corrida",
//         onDelete: "CASCADE",
//         }));

//         await queryRunner.createTable(new Table({
//         name: "rota_volta_funcionarios",
//         columns: [
//             {
//             name: "rotaVoltaId",
//             type: "int",
//             },
//             {
//             name: "funcionarioId",
//             type: "int",
//             },
//         ],
//         }));

//         await queryRunner.createForeignKey("rota_volta_funcionarios", new TableForeignKey({
//         columnNames: ["rotaVoltaId"],
//         referencedColumnNames: ["id"],
//         referencedTableName: "rota_volta",
//         onDelete: "CASCADE",
//         }));

//         await queryRunner.createForeignKey("rota_volta_funcionarios", new TableForeignKey({
//         columnNames: ["funcionarioId"],
//         referencedColumnNames: ["id"],
//         referencedTableName: "funcionario",
//         onDelete: "CASCADE",
//         }));
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.dropTable("rota_volta_funcionarios");
//         await queryRunner.dropTable("rota_volta");
//     }
// }
