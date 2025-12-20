import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from "typeorm";

export class UpdateMotoristaToInsertCpfColumn1766181684991 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.addColumn("motorista", new TableColumn({
            name: "cpf",
            type: "varchar",
            length: "20",
            isUnique: true,
            isNullable: false
        }));

        await queryRunner.createIndex("motorista", new TableIndex({
            name: "UQ_motorista_cpf",
            columnNames: ["cpf"]
        }));

    }

      public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverter alterações
        await queryRunner.dropUniqueConstraint("motorista", "UQ_motorista_cpf");
        await queryRunner.dropColumn("motorista", "cpf");
    }
}
