import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class FixCircularRotas1766021630727 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        // --- 1. LIMPEZA NA TABELA ROTA_IDA ---
        const tableIda = await queryRunner.getTable("rota_ida");
        
        // Busca e remove a FK se ela existir
        const fkIda = tableIda?.foreignKeys.find(fk => fk.columnNames.indexOf("corridaId") !== -1);
        if (fkIda) {
            await queryRunner.dropForeignKey("rota_ida", fkIda);
        }
        
        // Correção: Uso do queryRunner para verificar se a coluna existe
        if (await queryRunner.hasColumn("rota_ida", "corridaId")) {
            await queryRunner.dropColumn("rota_ida", "corridaId");
        }

        // --- 2. LIMPEZA NA TABELA ROTA_VOLTA ---
        const tableVolta = await queryRunner.getTable("rota_volta");
        
        // Busca e remove a FK se ela existir
        const fkVolta = tableVolta?.foreignKeys.find(fk => fk.columnNames.indexOf("corridaId") !== -1);
        if (fkVolta) {
            await queryRunner.dropForeignKey("rota_volta", fkVolta);
        }
        
        // Correção: Uso do queryRunner para verificar se a coluna existe
        if (await queryRunner.hasColumn("rota_volta", "corridaId")) {
            await queryRunner.dropColumn("rota_volta", "corridaId");
        }

        // --- 3. GARANTIR INTEGRIDADE NA TABELA CORRIDA ---
        const tableCorrida = await queryRunner.getTable("corrida");
        
        // Função auxiliar interna para recriar as chaves estrangeiras de forma segura
        const resetFK = async (col: string, refTable: string) => {
            // Recarrega o estado atualizado da tabela para evitar erros de cache de metadados
            const currentTableCorrida = await queryRunner.getTable("corrida");
            const existingFk = currentTableCorrida?.foreignKeys.find(fk => fk.columnNames.indexOf(col) !== -1);
            
            if (existingFk) {
                await queryRunner.dropForeignKey("corrida", existingFk);
            }
            
            // Cria a FK garantindo que a Corrida seja a "dona" da relação
            await queryRunner.createForeignKey("corrida", new TableForeignKey({
                columnNames: [col],
                referencedColumnNames: ["id"],
                referencedTableName: refTable,
                onDelete: "CASCADE"
            }));
        };

        // Verifica se as colunas existem na tabela corrida antes de aplicar as FKs
        if (await queryRunner.hasColumn("corrida", "rotaIdaId")) {
            await resetFK("rotaIdaId", "rota_ida");
        }
        
        if (await queryRunner.hasColumn("corrida", "rotaVoltaId")) {
            await resetFK("rotaVoltaId", "rota_volta");
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Para reverter, você teria que readicionar as colunas em rota_ida/volta 
        // e remover de corrida, mas geralmente em ajustes de normalização 
        // o rollback é feito restaurando um backup ou via nova migration.
    }
}
