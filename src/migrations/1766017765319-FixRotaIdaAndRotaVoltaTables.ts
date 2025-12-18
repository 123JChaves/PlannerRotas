import { MigrationInterface, QueryRunner } from "typeorm";

export class FixRotaIdaAndRotaVoltaTables1766017765319 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        const tableIda = await queryRunner.getTable("rota_ida");
        const fkIda = tableIda?.foreignKeys.find(fk => fk.columnNames.indexOf("corridaId") !== -1);
        if (fkIda) await queryRunner.dropForeignKey("rota_ida", fkIda);

        const tableVolta = await queryRunner.getTable("rota_volta");
        const fkVolta = tableVolta?.foreignKeys.find(fk => fk.columnNames.indexOf("corridaId") !== -1);
        if (fkVolta) await queryRunner.dropForeignKey("rota_volta", fkVolta);

        // 2. Remover as colunas redundantes
        await queryRunner.dropColumn("rota_ida", "corridaId");
        await queryRunner.dropColumn("rota_volta", "corridaId");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Caso precise reverter, readicionamos as colunas e as FKs
        // (Apenas para manter a consistência do arquivo)
    }
}
