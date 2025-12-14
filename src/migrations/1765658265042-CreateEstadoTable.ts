import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateEstadoTable1765658265042 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.createTable(new Table({
        
            name: "estado",
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
                name: "paisId",
                type: "int",
                },
            ],
        }));

        await queryRunner.createForeignKey("estado", new TableForeignKey({
        columnNames: ["paisId"],
        referencedColumnNames: ["id"],
        referencedTableName: "pais",
        onDelete: "CASCADE",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("estado");
    }
}
