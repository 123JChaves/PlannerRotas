import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsersTable1763492893418 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.createTable(new Table({

            name: "user",
            columns: [
                {
                name: "id",
                type: "int",
                isPrimary: true,
                isGenerated: true,
                generationStrategy: "increment",
                },
                {
                name: "nome",
                type: "varchar",
                length: "255",
                },
                {
                name: "email",
                type: "varchar",
                length: "255",
                isUnique: true,
                },
                {
                name: "senha",
                type: "varchar",
                length: "255",
                },
                {
                name: "createDate",
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
                },
                {
                name: "updateDate",
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
                onUpdate: "CURRENT_TIMESTAMP",
                },
            ],
            }));
        }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("user");
        }
}
