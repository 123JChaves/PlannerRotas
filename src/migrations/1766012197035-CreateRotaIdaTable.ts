import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRotaIdaTable1766012197035 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.createTable(new Table({
            
            name: "rota_ida",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                }
            ]

        }));
    };

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropTable("rota_ida");

    }

}
