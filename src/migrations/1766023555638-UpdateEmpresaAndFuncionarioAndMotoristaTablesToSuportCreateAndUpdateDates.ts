import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateEmpresaAndFuncionarioAndMotoristaTablesToSuportCreateAndUpdateDates1766023555638 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.addColumn("empresa", new TableColumn({
                name: "createDate",
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
        }));
        await queryRunner.addColumn("empresa", new TableColumn({
                name: "updateDate",
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
                onUpdate: "CURRENT_TIMESTAMP",
        }));
        await queryRunner.addColumn("funcionario", new TableColumn({
                name: "createDate",
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
        }));
        await queryRunner.addColumn("funcionario", new TableColumn({
                name: "updateDate",
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
                onUpdate: "CURRENT_TIMESTAMP",
        }));
                await queryRunner.addColumn("motorista", new TableColumn({
                name: "createDate",
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
        }));
        await queryRunner.addColumn("motorista", new TableColumn({
                name: "updateDate",
                type: "timestamp",
                default: "CURRENT_TIMESTAMP",
                onUpdate: "CURRENT_TIMESTAMP",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
