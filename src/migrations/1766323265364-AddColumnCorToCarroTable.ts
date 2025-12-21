import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnCorToCarroTable1766323265364 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.addColumn("carro", new TableColumn({
            name: "cor",
            type: "varchar",
            length: "20",
            isNullable: true
        }))

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropColumn("carro", "cor");

    }

}
