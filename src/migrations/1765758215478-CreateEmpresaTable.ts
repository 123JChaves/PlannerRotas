import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateEmpresaTable1765758215478 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.createTable(new Table({

            name: "empresa",
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
            ],
        }));

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropTable("empresa");

    }

}
