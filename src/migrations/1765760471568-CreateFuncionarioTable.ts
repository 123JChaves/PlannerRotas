import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateFuncionarioTable1765760471568 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

                await queryRunner.createTable(new Table({

            name: "funcionario",
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
                    name: "empresaId",
                    type: "int",
                },
            ],
        }));

        await queryRunner.createForeignKey("funcionario", new TableForeignKey({
            columnNames: ["empresaId"],
            referencedColumnNames: ["id"],
            referencedTableName: "empresa",
            onDelete: "CASCADE",
        }));

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropTable("funcionario");

    }

}
