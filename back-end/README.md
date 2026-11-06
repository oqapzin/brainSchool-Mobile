# BrainCodeSchool API — Tech Challenge Fase 02

API REST para a plataforma de blogging dinâmico da rede pública de educação, permitindo que professores publiquem aulas e alunos as consultem de forma centralizada.

Projeto desenvolvido para o Tech Challenge da Fase 02 do curso **Full Stack Development — POSTECH**.

**Autores:** Diego de Oliveira Gonçalves RM:371697

             Jhenifer Elisabete Augusto dos Santos  RM:374206

             Pedro Henrique Albuquerque   RM:371086

---

## Sumário

- [Visão geral](#visão-geral)
- [Arquitetura da aplicação](#arquitetura-da-aplicação)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Como executar o projeto](#como-executar-o-projeto)
- [Documentação da API (Swagger)](#documentação-da-api-swagger)
- [Endpoints disponíveis](#endpoints-disponíveis)
- [Testes e cobertura](#testes-e-cobertura)
- [CI/CD com GitHub Actions](#cicd-com-github-actions)
- [Relato de experiências e desafios](#relato-de-experiências-e-desafios)

---

## Visão geral

O back-end, antes implementado na plataforma OutSystems, foi refatorado em **Node.js/Nest.js** para suportar a escala nacional da aplicação. Os dados de postagens passaram a ser persistidos em um banco **PostgreSQL** relacional, com toda a aplicação containerizada via **Docker** e testada automaticamente através de um pipeline de **CI/CD** no GitHub Actions.

## Arquitetura da aplicação

A aplicação segue a arquitetura modular padrão do Nest.js, baseada em **Controllers**, **Services** e **Entities**, seguindo os princípios de separação de responsabilidades e injeção de dependência:

```
Cliente (HTTP)
      │
      ▼
PostsController   → Responsável por receber requisições HTTP, validar payloads (DTOs) e delegar regras de negócio
      │
      ▼
PostsService      → Contém a lógica de negócio e orquestra o acesso a dados
      │
      ▼
TypeORM Repository → Camada de persistência
      │
      ▼
PostgreSQL         → Banco de dados relacional
```

- **DTOs** (`CreatePostDto`, `UpdatePostDto`) garantem a validação de entrada usando `class-validator`.
- **Entity `Post`** mapeia a tabela `posts` no PostgreSQL via TypeORM.
- **Swagger** documenta automaticamente todos os endpoints a partir dos decorators presentes em controllers e entidades.
- **ValidationPipe global** rejeita automaticamente propriedades não esperadas no corpo das requisições (`whitelist` + `forbidNonWhitelisted`).

## Tecnologias utilizadas

| Camada              | Tecnologia                          |
| ------------------- | ----------------------------------- |
| Runtime             | Node.js 20                          |
| Framework           | Nest.js 10                          |
| Banco de dados      | PostgreSQL 16                       |
| ORM                 | TypeORM                             |
| Documentação de API | Swagger (OpenAPI)                   |
| Testes              | Jest                                |
| Containerização     | Docker / Docker Compose             |
| CI/CD               | GitHub Actions                      |
| Validação           | class-validator / class-transformer |

## Estrutura de pastas

```
blog-api/
├── src/
│   ├── comments/
│   ├── posts/
│   │   ├── dto/
│   │   │   ├── create-post.dto.ts
│   │   │   └── update-post.dto.ts
│   │   ├── entities/
│   │   │   └── post.entity.ts
│   │   ├── posts.controller.ts
│   │   ├── posts.controller.spec.ts
│   │   ├── posts.service.ts
│   │   ├── posts.service.spec.ts
│   │   └── posts.module.ts
│   ├── app.module.ts
│   └── main.ts
├── Dockerfile
├── .env.example
├── package.json
└── README.md
```

## Como executar o projeto

### Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose instalados (recomendado), **ou**
- Node.js 20+ e uma instância local do PostgreSQL 16, se optar por rodar sem Docker.

### Opção 1 — Usando Docker (recomendado)

```bash
# Clonar o repositório
git clone https://github.com/<seu-usuario>/blog-api.git
cd blog-api

# Na raiz do monorepo, configurar as variáveis
cp .env.example .env

# Subir toda a aplicação e o banco PostgreSQL
docker compose up --build
```

A aplicação estará disponível em `http://localhost:3000` e a documentação Swagger em `http://localhost:3000/api-docs`.

### Opção 2 — Ambiente local (sem Docker)

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente e ajustar conforme seu PostgreSQL local
cp .env.example .env

# Subir em modo desenvolvimento (hot-reload)
npm run start:dev
```

## Documentação da API (Swagger)

Após iniciar a aplicação, a documentação interativa (OpenAPI) fica disponível em:

```
http://localhost:3000/api-docs
```

Nela é possível visualizar todos os endpoints, seus parâmetros, DTOs de entrada/saída e testar as requisições diretamente pelo navegador.

## Endpoints disponíveis

| Método | Rota                      | Descrição                                             |
| ------ | ------------------------- | ----------------------------------------------------- |
| GET    | `/posts`                  | Lista todas as postagens                              |
| GET    | `/posts/search?q=termo`   | Busca postagens por palavra-chave no título/conteúdo  |
| GET    | `/posts/:id`              | Retorna o conteúdo completo de uma postagem           |
| POST   | `/posts`                  | Cria uma nova postagem (`title`, `content`, `author`) |
| PUT    | `/posts/:id`              | Edita uma postagem existente                          |
| DELETE | `/posts/:id`              | Exclui uma postagem                                   |
| GET    | `/posts/:postId/comments` | Lista comentários de uma postagem                     |
| POST   | `/posts/:postId/comments` | Publica comentário de usuário autenticado             |
| PUT    | `/comments/:id`           | Edita comentário próprio                              |
| DELETE | `/comments/:id`           | Exclui comentário próprio ou por docente              |

### Exemplo — criar uma postagem

```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introdução à Matemática Financeira",
    "content": "Neste post vamos explorar os conceitos de juros simples e compostos...",
    "author": "Professor João Silva"
  }'
```

### Exemplo — buscar postagens

```bash
curl "http://localhost:3000/posts/search?q=matemática"
```

## Testes e cobertura

O projeto utiliza **Jest** para testes unitários dos controllers e services, cobrindo os fluxos críticos de criação, listagem, busca, atualização e exclusão de postagens — incluindo cenários de erro (postagem não encontrada).

```bash
# Executar todos os testes
npm run test

# Executar os testes com relatório de cobertura
npm run test:cov
```

O pipeline de CI está configurado para exigir, no mínimo, **20% de cobertura de código** (`coverageThreshold` no `package.json`), conforme os requisitos técnicos do desafio.

## CI/CD com GitHub Actions

O workflow definido em `../.github/workflows/ci-cd.yml` é executado a cada `push` ou `pull request` nas branches `main` e `develop`, e realiza:

1. Instalação de dependências do backend e frontend (`npm ci`);
2. Lint e build das duas aplicações;
3. Execução dos testes unitários do backend com PostgreSQL efêmero;
4. Build da stack usando o Docker Compose;
5. Smoke tests do backend e frontend em containers;
6. (Somente na branch `main`) Build e push das imagens do backend e frontend para o GitHub Container Registry usando `GITHUB_TOKEN`.

## Relato de experiências e desafios

Durante o desenvolvimento desta fase, o principal desafio foi migrar a lógica de negócio, antes implementada visualmente na OutSystems, para uma arquitetura de código explícita em Nest.js, mantendo a clareza modular (Controller → Service → Repository) que facilita manutenção e testes.

A escolha do PostgreSQL como banco relacional se justificou pela natureza estruturada dos dados de postagens (título, conteúdo, autor, datas), o que se encaixa naturalmente em um modelo relacional simples, evitando a complexidade adicional de um banco NoSQL para este domínio.

Outro ponto de atenção foi garantir que a rota de busca (`GET /posts/search`) fosse declarada antes da rota `GET /posts/:id` no controller, já que o Nest.js resolve rotas na ordem de declaração — caso contrário, `/posts/search` seria interpretado como uma tentativa de buscar um post com `id = "search"`.

Por fim, a containerização com Docker Compose (API + PostgreSQL) simplificou consideravelmente o onboarding do time, eliminando divergências de ambiente entre os desenvolvedores.
