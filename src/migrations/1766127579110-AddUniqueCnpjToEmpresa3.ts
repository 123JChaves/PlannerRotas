import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueCnpjToEmpresa31766127579110 implements MigrationInterface {
    name = 'AddUniqueCnpjToEmpresa31766127579110'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`corrida\` DROP FOREIGN KEY \`FK_f0e3dbc2d0601cf88c2787588d1\``);
        await queryRunner.query(`ALTER TABLE \`funcionario\` DROP FOREIGN KEY \`FK_a2a616862df841a81cb92f07b8c\``);
        await queryRunner.query(`ALTER TABLE \`funcionario\` ADD \`cpf\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`funcionario\` ADD UNIQUE INDEX \`IDX_a84346b7f338dec9a7eeae4993\` (\`cpf\`)`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`createDate\` \`createDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`updateDate\` \`updateDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`carro\` DROP FOREIGN KEY \`FK_a3ec2294ca2bcfc5439b2f472da\``);
        await queryRunner.query(`ALTER TABLE \`carro\` CHANGE \`motoristaId\` \`motoristaId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`motorista\` CHANGE \`createDate\` \`createDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`motorista\` CHANGE \`updateDate\` \`updateDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`corrida\` DROP FOREIGN KEY \`FK_e66d3cbb161f37d275a58f2b3a8\``);
        await queryRunner.query(`ALTER TABLE \`corrida\` DROP FOREIGN KEY \`FK_10ac37bd4ad3373c874e26bbb97\``);
        await queryRunner.query(`ALTER TABLE \`corrida\` DROP FOREIGN KEY \`FK_396fa7f29311ded13c840745c01\``);
        await queryRunner.query(`ALTER TABLE \`corrida\` CHANGE \`inicioDaCorrida\` \`inicioDaCorrida\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`corrida\` CHANGE \`fimDaCorrida\` \`fimDaCorrida\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`corrida\` CHANGE \`motoristaId\` \`motoristaId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`corrida\` CHANGE \`empresaId\` \`empresaId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`corrida\` CHANGE \`rotaIdaId\` \`rotaIdaId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`corrida\` CHANGE \`rotaVoltaId\` \`rotaVoltaId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`funcionario\` DROP FOREIGN KEY \`FK_b119fca44ac4a085869edaf95e7\``);
        await queryRunner.query(`ALTER TABLE \`funcionario\` DROP FOREIGN KEY \`FK_e0c34582bf16123a22604f14956\``);
        await queryRunner.query(`ALTER TABLE \`funcionario\` CHANGE \`createDate\` \`createDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`funcionario\` CHANGE \`updateDate\` \`updateDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`funcionario\` CHANGE \`empresaId\` \`empresaId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`funcionario\` CHANGE \`logradouroId\` \`logradouroId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`funcionario\` CHANGE \`corridaId\` \`corridaId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`empresa\` DROP FOREIGN KEY \`FK_f855afda47a8dfc4676edb38527\``);
        await queryRunner.query(`ALTER TABLE \`empresa\` ADD UNIQUE INDEX \`IDX_d6abff4b490c37b2934a5fe40f\` (\`cnpj\`)`);
        await queryRunner.query(`ALTER TABLE \`empresa\` CHANGE \`createDate\` \`createDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`empresa\` CHANGE \`updateDate\` \`updateDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`empresa\` CHANGE \`logradouroId\` \`logradouroId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`logradouro\` DROP FOREIGN KEY \`FK_1ebf3f4855cc3dbd601d46cf7fb\``);
        await queryRunner.query(`ALTER TABLE \`logradouro\` CHANGE \`bairroId\` \`bairroId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`bairro\` DROP FOREIGN KEY \`FK_fb1902a2eb6c78aabd731ba8cbb\``);
        await queryRunner.query(`ALTER TABLE \`bairro\` CHANGE \`cidadeId\` \`cidadeId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`cidade\` DROP FOREIGN KEY \`FK_2ec6c38998b498e9f517a6c8399\``);
        await queryRunner.query(`ALTER TABLE \`cidade\` CHANGE \`estadoId\` \`estadoId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`estado\` DROP FOREIGN KEY \`FK_9016d04f7981ac3f2cb6f557d16\``);
        await queryRunner.query(`ALTER TABLE \`estado\` CHANGE \`paisId\` \`paisId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`carro\` ADD CONSTRAINT \`FK_a3ec2294ca2bcfc5439b2f472da\` FOREIGN KEY (\`motoristaId\`) REFERENCES \`motorista\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`corrida\` ADD CONSTRAINT \`FK_e66d3cbb161f37d275a58f2b3a8\` FOREIGN KEY (\`motoristaId\`) REFERENCES \`motorista\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`corrida\` ADD CONSTRAINT \`FK_f0e3dbc2d0601cf88c2787588d1\` FOREIGN KEY (\`empresaId\`) REFERENCES \`empresa\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`corrida\` ADD CONSTRAINT \`FK_10ac37bd4ad3373c874e26bbb97\` FOREIGN KEY (\`rotaIdaId\`) REFERENCES \`rota_ida\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`corrida\` ADD CONSTRAINT \`FK_396fa7f29311ded13c840745c01\` FOREIGN KEY (\`rotaVoltaId\`) REFERENCES \`rota_volta\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`funcionario\` ADD CONSTRAINT \`FK_a2a616862df841a81cb92f07b8c\` FOREIGN KEY (\`empresaId\`) REFERENCES \`empresa\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`funcionario\` ADD CONSTRAINT \`FK_b119fca44ac4a085869edaf95e7\` FOREIGN KEY (\`logradouroId\`) REFERENCES \`logradouro\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`funcionario\` ADD CONSTRAINT \`FK_e0c34582bf16123a22604f14956\` FOREIGN KEY (\`corridaId\`) REFERENCES \`corrida\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`empresa\` ADD CONSTRAINT \`FK_f855afda47a8dfc4676edb38527\` FOREIGN KEY (\`logradouroId\`) REFERENCES \`logradouro\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`logradouro\` ADD CONSTRAINT \`FK_1ebf3f4855cc3dbd601d46cf7fb\` FOREIGN KEY (\`bairroId\`) REFERENCES \`bairro\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bairro\` ADD CONSTRAINT \`FK_fb1902a2eb6c78aabd731ba8cbb\` FOREIGN KEY (\`cidadeId\`) REFERENCES \`cidade\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cidade\` ADD CONSTRAINT \`FK_2ec6c38998b498e9f517a6c8399\` FOREIGN KEY (\`estadoId\`) REFERENCES \`estado\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`estado\` ADD CONSTRAINT \`FK_9016d04f7981ac3f2cb6f557d16\` FOREIGN KEY (\`paisId\`) REFERENCES \`pais\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`estado\` DROP FOREIGN KEY \`FK_9016d04f7981ac3f2cb6f557d16\``);
        await queryRunner.query(`ALTER TABLE \`cidade\` DROP FOREIGN KEY \`FK_2ec6c38998b498e9f517a6c8399\``);
        await queryRunner.query(`ALTER TABLE \`bairro\` DROP FOREIGN KEY \`FK_fb1902a2eb6c78aabd731ba8cbb\``);
        await queryRunner.query(`ALTER TABLE \`logradouro\` DROP FOREIGN KEY \`FK_1ebf3f4855cc3dbd601d46cf7fb\``);
        await queryRunner.query(`ALTER TABLE \`empresa\` DROP FOREIGN KEY \`FK_f855afda47a8dfc4676edb38527\``);
        await queryRunner.query(`ALTER TABLE \`funcionario\` DROP FOREIGN KEY \`FK_e0c34582bf16123a22604f14956\``);
        await queryRunner.query(`ALTER TABLE \`funcionario\` DROP FOREIGN KEY \`FK_b119fca44ac4a085869edaf95e7\``);
        await queryRunner.query(`ALTER TABLE \`funcionario\` DROP FOREIGN KEY \`FK_a2a616862df841a81cb92f07b8c\``);
        await queryRunner.query(`ALTER TABLE \`corrida\` DROP FOREIGN KEY \`FK_396fa7f29311ded13c840745c01\``);
        await queryRunner.query(`ALTER TABLE \`corrida\` DROP FOREIGN KEY \`FK_10ac37bd4ad3373c874e26bbb97\``);
        await queryRunner.query(`ALTER TABLE \`corrida\` DROP FOREIGN KEY \`FK_f0e3dbc2d0601cf88c2787588d1\``);
        await queryRunner.query(`ALTER TABLE \`corrida\` DROP FOREIGN KEY \`FK_e66d3cbb161f37d275a58f2b3a8\``);
        await queryRunner.query(`ALTER TABLE \`carro\` DROP FOREIGN KEY \`FK_a3ec2294ca2bcfc5439b2f472da\``);
        await queryRunner.query(`ALTER TABLE \`estado\` CHANGE \`paisId\` \`paisId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`estado\` ADD CONSTRAINT \`FK_9016d04f7981ac3f2cb6f557d16\` FOREIGN KEY (\`paisId\`) REFERENCES \`pais\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cidade\` CHANGE \`estadoId\` \`estadoId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`cidade\` ADD CONSTRAINT \`FK_2ec6c38998b498e9f517a6c8399\` FOREIGN KEY (\`estadoId\`) REFERENCES \`estado\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bairro\` CHANGE \`cidadeId\` \`cidadeId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`bairro\` ADD CONSTRAINT \`FK_fb1902a2eb6c78aabd731ba8cbb\` FOREIGN KEY (\`cidadeId\`) REFERENCES \`cidade\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`logradouro\` CHANGE \`bairroId\` \`bairroId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`logradouro\` ADD CONSTRAINT \`FK_1ebf3f4855cc3dbd601d46cf7fb\` FOREIGN KEY (\`bairroId\`) REFERENCES \`bairro\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`empresa\` CHANGE \`logradouroId\` \`logradouroId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`empresa\` CHANGE \`updateDate\` \`updateDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`empresa\` CHANGE \`createDate\` \`createDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`empresa\` DROP INDEX \`IDX_d6abff4b490c37b2934a5fe40f\``);
        await queryRunner.query(`ALTER TABLE \`empresa\` ADD CONSTRAINT \`FK_f855afda47a8dfc4676edb38527\` FOREIGN KEY (\`logradouroId\`) REFERENCES \`logradouro\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`funcionario\` CHANGE \`corridaId\` \`corridaId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`funcionario\` CHANGE \`logradouroId\` \`logradouroId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`funcionario\` CHANGE \`empresaId\` \`empresaId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`funcionario\` CHANGE \`updateDate\` \`updateDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`funcionario\` CHANGE \`createDate\` \`createDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`funcionario\` ADD CONSTRAINT \`FK_e0c34582bf16123a22604f14956\` FOREIGN KEY (\`corridaId\`) REFERENCES \`corrida\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`funcionario\` ADD CONSTRAINT \`FK_b119fca44ac4a085869edaf95e7\` FOREIGN KEY (\`logradouroId\`) REFERENCES \`logradouro\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`corrida\` CHANGE \`rotaVoltaId\` \`rotaVoltaId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`corrida\` CHANGE \`rotaIdaId\` \`rotaIdaId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`corrida\` CHANGE \`empresaId\` \`empresaId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`corrida\` CHANGE \`motoristaId\` \`motoristaId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`corrida\` CHANGE \`fimDaCorrida\` \`fimDaCorrida\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`corrida\` CHANGE \`inicioDaCorrida\` \`inicioDaCorrida\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`corrida\` ADD CONSTRAINT \`FK_396fa7f29311ded13c840745c01\` FOREIGN KEY (\`rotaVoltaId\`) REFERENCES \`rota_volta\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`corrida\` ADD CONSTRAINT \`FK_10ac37bd4ad3373c874e26bbb97\` FOREIGN KEY (\`rotaIdaId\`) REFERENCES \`rota_ida\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`corrida\` ADD CONSTRAINT \`FK_e66d3cbb161f37d275a58f2b3a8\` FOREIGN KEY (\`motoristaId\`) REFERENCES \`motorista\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`motorista\` CHANGE \`updateDate\` \`updateDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`motorista\` CHANGE \`createDate\` \`createDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`carro\` CHANGE \`motoristaId\` \`motoristaId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`carro\` ADD CONSTRAINT \`FK_a3ec2294ca2bcfc5439b2f472da\` FOREIGN KEY (\`motoristaId\`) REFERENCES \`motorista\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`updateDate\` \`updateDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`createDate\` \`createDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`funcionario\` DROP INDEX \`IDX_a84346b7f338dec9a7eeae4993\``);
        await queryRunner.query(`ALTER TABLE \`funcionario\` DROP COLUMN \`cpf\``);
        await queryRunner.query(`ALTER TABLE \`funcionario\` ADD CONSTRAINT \`FK_a2a616862df841a81cb92f07b8c\` FOREIGN KEY (\`empresaId\`) REFERENCES \`empresa\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`corrida\` ADD CONSTRAINT \`FK_f0e3dbc2d0601cf88c2787588d1\` FOREIGN KEY (\`empresaId\`) REFERENCES \`empresa\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
