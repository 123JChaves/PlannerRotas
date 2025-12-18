import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class NormalizeCorridaAdnFuncionario1766020401564 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        const tableFuncionario = await queryRunner.getTable("funcionario");
        
        // Remove a FK atual para recriar com as regras de integridade corretas (se existir)
        const fkFuncCorrida = tableFuncionario?.foreignKeys.find(fk => fk.columnNames.indexOf("corridaId") !== -1);
        if (fkFuncCorrida) {
            await queryRunner.dropForeignKey("funcionario", fkFuncCorrida);
        }

        await queryRunner.createForeignKey("funcionario", new TableForeignKey({
            name: "FK_funcionario_corrida",
            columnNames: ["corridaId"],
            referencedColumnNames: ["id"],
            referencedTableName: "corrida",
            onDelete: "SET NULL", // Se a corrida for apagada, o funcionário fica disponível
        }));

        // 2. AJUSTE NA TABELA CORRIDA (Normalização de Nomes e ON DELETE)
        const tableCorrida = await queryRunner.getTable("corrida");

        // Função auxiliar para resetar FKs e garantir consistência
        const resetFK = async (tableName: string, columnName: string, refTable: string) => {
            const table = await queryRunner.getTable(tableName);
            const fk = table?.foreignKeys.find(f => f.columnNames.indexOf(columnName) !== -1);
            if (fk) await queryRunner.dropForeignKey(tableName, fk);
            
            await queryRunner.createForeignKey(tableName, new TableForeignKey({
                columnNames: [columnName],
                referencedColumnNames: ["id"],
                referencedTableName: refTable,
                onDelete: "CASCADE" // Recomendado para relações 1:1 de dependência
            }));
        };

        // Normalizando as relações OneToOne na tabela Corrida
        await resetFK("corrida", "rotaIdaId", "rota_ida");
        await resetFK("corrida", "rotaVoltaId", "rota_volta");
        await resetFK("corrida", "motoristaId", "motorista");
        await resetFK("corrida", "empresaId", "empresa");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Lógica de rollback se necessário
    }
}
