import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateEmpresaTableToAddCnpjColumn1766108433659 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.addColumn("empresa", new TableColumn({
            name: "cnpj",
            type: "varchar(18)", // Formato 00.000.000/0001-00
            isUnique: true,      // O Banco de Dados barrará duplicatas
            isNullable: false
    }));
}

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
