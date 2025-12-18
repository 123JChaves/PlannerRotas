import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class UpDateRotaIdaAndRotaVoltaAndCorridaTables1766014154085 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        // Adicione colunas à tabela corrida
        await queryRunner.addColumn("corrida", new TableColumn({

            name: "rotaIdaId",
            type: "int",
            }));

        await queryRunner.addColumn("corrida", new TableColumn({
            name: "rotaVoltaId",
            type: "int",
            }));

        await queryRunner.addColumn("corrida", new TableColumn({
            name: "inicioDaCorrida",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
        }));

        await queryRunner.addColumn("corrida", new TableColumn({
            name: "fimDaCorrida",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
        }));

        // Adicione chaves estrangeiras à tabela corrida
        await queryRunner.createForeignKey("corrida", new TableForeignKey({
            columnNames: ["rotaIdaId"],
            referencedColumnNames: ["id"],
            referencedTableName: "rota_ida",
            onDelete: "CASCADE",
        }));

        await queryRunner.createForeignKey("corrida", new TableForeignKey({
            columnNames: ["rotaVoltaId"],
            referencedColumnNames: ["id"],
            referencedTableName: "rota_volta",
            onDelete: "CASCADE",
        }));

        // Adicione colunas à tabela rota_ida e rota_volta
        await queryRunner.addColumn("rota_ida", new TableColumn({
        
            name: "corridaId",
            type: "int",
        }));

        await queryRunner.addColumn("rota_volta", new TableColumn({
        
            name: "corridaId",
            type: "int",
        }));

        // Adicione chaves estrangeiras à tabela rota_ida e rota_volta
        await queryRunner.createForeignKey("rota_ida", new TableForeignKey({
            columnNames: ["corridaId"],
            referencedColumnNames: ["id"],
            referencedTableName: "corrida",
            onDelete: "CASCADE",
        }));

        await queryRunner.createForeignKey("rota_volta", new TableForeignKey({
            columnNames: ["corridaId"],
            referencedColumnNames: ["id"],
            referencedTableName: "corrida",
            onDelete: "CASCADE",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remova as colunas e chaves estrangeiras adicionadas anteriormente
        await queryRunner.dropForeignKey("corrida", "fk_corrida_rotaIdaId");
        await queryRunner.dropForeignKey("corrida", "fk_corrida_rotaVoltaId");
        await queryRunner.dropColumn("corrida", "rotaIdaId");
        await queryRunner.dropColumn("corrida", "rotaVoltaId");
        await queryRunner.dropColumn("corrida", "inicioDaCorrida");
        await queryRunner.dropColumn("corrida", "fimDaCorrida");

        await queryRunner.dropForeignKey("rota_ida", "fk_rota_ida_corridaId");
        await queryRunner.dropForeignKey("rota_volta", "fk_rota_volta_corridaId");
        await queryRunner.dropColumn("rota_ida", "corridaId");
        await queryRunner.dropColumn("rota_volta", "corridaId");
    }
}