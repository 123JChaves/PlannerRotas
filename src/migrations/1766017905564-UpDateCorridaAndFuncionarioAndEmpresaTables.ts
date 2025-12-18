import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class UpDateCorridaAndFuncionarioAndEmpresaTables1766017905564 implements MigrationInterface {


    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.addColumn("corrida", new TableColumn({

            name: "motoristaId",
            type: "int",

        }));

        await queryRunner.addColumn("corrida", new TableColumn({

            name: "funcionarioId",
            type: "int",

        }));

        await queryRunner.addColumn("corrida", new TableColumn({

            name: "empresaId",
            type: "int",

        }));

        await queryRunner.createForeignKey("corrida", new TableForeignKey({
            columnNames:["motoristaId"],
            referencedColumnNames:["id"],
            referencedTableName:"motorista",
            onDelete: "CASCADE",
        }));

        await queryRunner.createForeignKey("corrida", new TableForeignKey({
            columnNames:["funcionarioId"],
            referencedColumnNames:["id"],
            referencedTableName: "funcionario",
            onDelete: "CASCADE",
        }));

        await queryRunner.createForeignKey("corrida", new TableForeignKey({
            columnNames:["empresaId"],
            referencedColumnNames:["id"],
            referencedTableName: "empresa",
            onDelete: "CASCADE",
        }));

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropColumn("corrida", "motoristaId");
        await queryRunner.dropColumn("corrida", "funcionarioId");
        await queryRunner.dropColumn("corrida", "emprsaId");
        await queryRunner.dropForeignKey("corrida", "fk_corrida_motoristaId");
        await queryRunner.dropForeignKey("corrida", "fk_corrida_funcionarioId");
        await queryRunner.dropForeignKey("corrida", "fk_corrida_empesaId");
        

    }

}
