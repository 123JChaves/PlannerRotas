import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class SetNullToEmpresaDeletMethod1766113306775 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey("funcionario", "FK_a2a616862df841a81cb92f07b8c");
        await queryRunner.createForeignKey("funcionario", new TableForeignKey({
            columnNames: ["empresaId"],
            referencedColumnNames: ["id"],
            referencedTableName: "empresa",
            onDelete: "SET NULL" // <-- Altera para SET NULL
        }));

        await queryRunner.dropForeignKey("corrida", "FK_f0e3dbc2d0601cf88c2787588d1");
        await queryRunner.createForeignKey("corrida", new TableForeignKey({
            columnNames: ["empresaId"],
            referencedColumnNames: ["id"],
            referencedTableName: "empresa",
            onDelete: "SET NULL" // Permite deletar a empresa
        }));
    
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
