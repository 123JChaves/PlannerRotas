import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateBairroTable1765659640046 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.createTable(new Table({

            name: "bairro",
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
                    name: "cidadeId",
                    type: "int",
                },
            ],
        }));
        
        await queryRunner.createForeignKey("bairro", new TableForeignKey({
            columnNames: ["cidadeId"],
            referencedColumnNames: ["id"],
            referencedTableName: "cidade",
            onDelete: "CASCADE",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("bairro");
    }

}
