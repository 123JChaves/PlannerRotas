import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCidadeTable1765659059776 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    
        await queryRunner.createTable(new Table({
        
            name: "cidade",
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
                name: "estadoId",
                type: "int",
                },
            ],
        }));

    await queryRunner.createForeignKey("cidade", new TableForeignKey({
        columnNames: ["estadoId"],
        referencedColumnNames: ["id"],
        referencedTableName: "estado",
        onDelete: "CASCADE",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("cidade");
    }
}
