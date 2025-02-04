# Mari's Boutik's Backend

Mari's Boutik's é uma API RESTful usada para gerenciar os dados do site [Mari's Boutik's](https://github.com/luigieterovik/maris-frontend), um E-Commerce voltado para venda de produtos cosméticos. Esta API fornece endpoints para funcionalidades como autenticação, gerenciamento de usuários, produtos, pedidos, e integração com plataformas de pagamento.

## Tecnologias Utilizadas

- **Node.js**: Plataforma principal para construção da API.
- **PostgreSQL**: Banco de dados relacional para armazenamento de dados.
- **Docker**: Gerenciamento de contêineres para fácil deploy e configuração.
- **AWS**: Serviços de cloud computing para armazenamento e deploy.
- **JWT**: Autenticação segura por tokens.
- **Axios**: Requisições HTTP internas.
- **Stripe**: Integração para pagamentos.
- **Mercado Pago**: Integração para pagamentos locais.

## Requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Docker
- PostgreSQL

## Instalação

1. Clone o repositório:
`git clone https://github.com/luigieterovik/maris-backend.git`

2. Acesse a pasta do projeto:
`cd maris-backend`

3. Instale as dependências:
`npm install`

4. Configure o banco de dados e as variáveis de ambiente.

## Execução

1. Execute o servidor de desenvolvimento:
`npm run dev`

2. A API estará disponível em:
`http://localhost:3000`

## Estrutura do Projeto

- `src/`: Código principal.
  - `app/`: Contém pastas de controllers, models e middlewares;
  - `database/`: Configuração do banco de dados e migrations.
  - `config/`: Integrações com base de dados, AWS e outros.

## Funcionalidades Principais

- Autenticação de usuários (JWT)
- CRUD de produtos
- Gerenciamento de pedidos
- Integração com plataformas de pagamento (Stripe e Mercado Pago)
- Upload e gerenciamento de arquivos na AWS S3

## Contribuição

Contribuições são bem-vindas! Siga estas etapas:

1. Faça um fork do projeto.
2. Crie um branch para sua feature:
`git checkout -b minha-feature`

3. Faça as alterações e comite:
`git commit -m "Adicionei nova feature"`

4. Envie para o repositório:
`git push origin minha-feature`

5. Abra um Pull Request.
