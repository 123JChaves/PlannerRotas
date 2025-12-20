import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateCarroTableToInsertPlacaColumn1766181061151 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.addColumn("carro", new TableColumn({
            name: "placa",
            type: "varchar(50)",
            isUnique: true,
            isNullable: false
        }));

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
