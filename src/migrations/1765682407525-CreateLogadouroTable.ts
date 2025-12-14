import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateLogadouroTable1765682407525 implements MigrationInterface {


        public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.createTable(new Table({

            name: "logradouro",
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
                    name: "numero",
                    type: "int",
                },
                {
                    name: "bairroId",
                    type: "int",
                },
            ],
        }));
        await queryRunner.createForeignKey("logradouro", new TableForeignKey({
            columnNames: ["bairroId"],
            referencedColumnNames: ["id"],
            referencedTableName: "bairro",
            onDelete: "CASCADE",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("logradouro")
    }

}
