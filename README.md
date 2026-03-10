# Advocacia Hub

Sistema de gerenciamento para escritórios de advocacia, permitindo o controle de clientes, processos, agendamentos e petições.

## Tecnologias Utilizadas

-   **Frontend**: React, TypeScript, Vite, TailwindCSS
-   **Backend**: Node.js, TypeScript, Express, Prisma
-   **Banco de Dados**: PostgreSQL
-   **Containerização**: Docker, Docker Compose

## Pré-requisitos

Para rodar este projeto, você vai precisar ter instalado em sua máquina:
-   Docker
-   Docker Compose (geralmente já vem com o Docker Desktop)

## Como Rodar o Projeto

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/Gleysson369/advocacy-hub.git
    ```

2.  **Navegue até a pasta do projeto:**
    ```bash
    cd advocacy-hub
    ```

3.  **Crie o arquivo de ambiente:**
    Copie o arquivo `.env.example` para um novo arquivo chamado `.env` e, se necessário, ajuste as variáveis.
    ```bash
    # No Windows (PowerShell)
    cp .env.example .env
    ```

4.  **Suba os containers com Docker Compose:**
    Este comando irá construir as imagens do frontend e backend, iniciar os containers e aplicar as migrações do banco de dados automaticamente.
    ```bash
    docker-compose up -d --build
    ```

5.  **Acesse a aplicação:**
    -   **Frontend**: Abra seu navegador em http://localhost
    -   **API (Backend)**: A API estará disponível em `http://localhost:3333`
    -   **Documentação da API (Swagger)**: http://localhost:3333/api-docs

Para parar todos os serviços, execute:
```bash
docker-compose down
```
