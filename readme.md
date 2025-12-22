# Requisitos

* Node.js 22 ou superior - Conferir a versão: 'node -v'

## Sequecia para criar o projeto

* Criar um arquivo package

'npm init -y

* Instalar o Express para gerenciar as requisições, rotas e URLs, entre outras 
* funcionalidades

'npm i express'

* Instalar os pacotes para suporte TypeScript

'npm i --save-dev @types/express'
'npm i --save-dev @types/node'

* Instalar o compilador projeto com TypeScript e reiniciar o projeto quando o
arquivo é modificado

'npm i --save-dev ts-node'

* Gerar o arquivo de cnfiguração para o TypeScript

'npx tsc --init'

* Executar o arquivo gerado com Node.js

'node dist/index.js'

* Instalar as dependências para conectar o Node.js (TypeScript) com banco de dados

'npm install typeorm --save'

* Biblioteca utilizada no TpyesCript para dicionar metaddos (informações adicionais) as classes.

'npm install reflect-metadata --save'

* Instalar o drive do Banco de Dados MySQL

'npm install mysql2 --save'

* Criação do banco de dados

'create database plannerrotas character set utf8mb4 collate utf8_unicode_ci

* Criar, com migrations, a tabeçala que será usada no banco de dados:

npx typeorm migration:create src/migrations/<nome-da-migrations>

npx typeorm migration:create src/migrations/CreateUsersTable

* Executar as migrations criadas:

npx typeorm migration:run -d dist/data-source.js

## A API é executada neste endereço: http://localhost:8080

* Importar uma biblioteca para criptografar senha:

npm install bcrypt
npm install --save-dev @types/bcrypt
Na entidade = import * as bcrypt from 'bcrypt';

* 

Planner de Rotas:

Criar um algoritmo para o planejamento de rotas;

Requisitos:

1) Criar uma rota com, no máximo, 5 endereços, sendo elas:

    a) Primeiro Embarque;
    b) Segundo Embarque;
    c) Terceiro Embarque;
    d) Quarto Embarque;
    e) Destino;

2) Criar um organizador de rotas com base na teoria dos grafos

3) O programa deve criar rotas, tendo como resuisito o horário
do primiro embarque, e o horário de entrada dos funcionários;

    ex) Os colaboradores que embarcam às 03h00 (criar um input), devem chegar até às 03h20;

    a) Inserir na rota tantos colaboradores (até 4) em que seja possível o deslocamento do ponto A (Primeiro Embarque), passando por todos os embarques, ao opnto B (Destino final), em que seja possível chegar no horário x, senão
    desmebrar rota.

3) Redução de custos;

    a) Calcular o valor total da corrida com base no algoritmo de cáculo x:

    a1) Calcular o valor da rota, e se o valor total de 1 rota focar mais caro do que desmembrar a rota em 2, 3 etc. rotas, então desmembrar até o menor valor total.

4) Integrar o algoritmo do requisito 3 com o requisito 2, sendo que o algoritmo 3 deve prevalecer.

## Execução

