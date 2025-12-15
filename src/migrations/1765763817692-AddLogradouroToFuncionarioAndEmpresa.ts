import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddLogradouroToFuncionarioAndEmpresa1765763817692 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.addColumn(
            "funcionario",
            new TableColumn({
                name: "logradouroId",
                type: "int",
            })
        );

        await queryRunner.addColumn(
            "empresa",
            new TableColumn({
                name: "logradouroId",
                type: "int",
            })
        );

        await queryRunner.createForeignKey("funcionario", new TableForeignKey({
            columnNames: ["logradouroId"],
            referencedColumnNames: ["id"],
            referencedTableName: "logradouro",
            onDelete: "CASCADE",
        }));

        await queryRunner.createForeignKey("empresa", new TableForeignKey({
            columnNames: ["logradouroId"],
            referencedColumnNames: ["id"],
            referencedTableName: "logradouro",
            onDelete: "CASCADE",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
        const tableFuncionario = await queryRunner.getTable("funcionario");
        
        const foreignKeyFuncionario = tableFuncionario?.foreignKeys.find(
        (fk) => fk.columnNames.indexOf("logradouroId") !== -1
        );
        if (!foreignKeyFuncionario) {
        throw new Error("Foreign Key for Funcionario is not defined.");
        }
        await queryRunner.dropForeignKey("funcionario", foreignKeyFuncionario);

        const tableEmpresa = await queryRunner.getTable("empresa");
        const foreignKeyEmpresa = tableEmpresa?.foreignKeys.find(
        (fk) => fk.columnNames.indexOf("logradouroId") !== -1
        );
        if (!foreignKeyEmpresa) {
        throw new Error("Foreign Key for Empresa is not defined.");
        }
        await queryRunner.dropForeignKey("empresa", foreignKeyEmpresa);

        await queryRunner.dropColumn("funcionario", "logradouroId");
        await queryRunner.dropColumn("empresa", "logradouroId");
    }
}