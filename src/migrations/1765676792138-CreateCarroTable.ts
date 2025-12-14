import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCarroTable1765676792138 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.createTable(new Table({

            name: "carro",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment",
                },
                {
                    name: "marca",
                    type: "varchar",
                    length: "255",
                },
                {
                    name: "modelo",
                    type: "varchar",
                    length: "255",
                },
                {
                    name: "ano",
                    type: "int",
                    length: "10",
                },
                {
                    name: "motoristaId",
                    type: "int",
                },
            ],
        }));

        await queryRunner.createForeignKey("carro", new TableForeignKey({
            columnNames: ["motoristaId"],
            referencedColumnNames: ["id"],
            referencedTableName: "motorista",
            onDelete: "CASCADE",
        }));

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropTable("carro");

    }

}
