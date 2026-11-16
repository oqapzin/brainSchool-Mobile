# 📱 Blog Escolar — Tech Challenge (Fase 04 | Pós-Tech)

Plataforma completa de **Blog Escolar** voltada a docentes e estudantes da rede pública de ensino. O projeto integra um aplicativo móvel construído em **React Native (Expo)** a uma API RESTful em **Node.js (NestJS)** com banco de dados relacional **PostgreSQL**, orquestrados via **Docker Compose**.

**Alunos:**
- **Diego de Oliveira Gonçalves** — RM: 371697
- **Jhenifer Elisabete Augusto dos Santos** — RM: 374206
- **Pedro Henrique Albuquerque** — RM: 371086

---

## 📌 Visão Geral da Aplicação 

Esta entrega consolida o **Mobile** do ecossistema de Blog Escolar, consumindo a API REST desenvolvida nas fases anteriores e oferecendo uma experiência fluida, segura e adaptada às permissões de cada perfil acadêmico:

### Funcionalidades Principais
- **Autenticação JWT e Sessão Persistente**: Login seguro com armazenamento criptografado (`expo-secure-store`), validação automática de expiração de token e atalhos rápidos de demonstração para os perfis padrão.
- **Feed de Postagens e Busca Dinâmica (`/(tabs)/index`)**: Listagem de aulas e artigos publicados com atualização *pull-to-refresh* e filtro em tempo real por palavra-chave (`GET /posts/search?q=`).
- **Leitura de Postagens e Comentários (`/post/[id]`)**: Visualização completa do conteúdo didático, listagem e publicação de comentários, com moderação integrada.
- **Gestão Administrativa de Postagens (`/post/create`, `/post/edit/[id]`, `/(tabs)/admin-posts`)**: Criação, edição e exclusão de postagens restritas a usuários com perfil **Docente (`professor`)**, respeitando a validação de autoria original.
- **Gestão Paginada de Professores e Estudantes (`/(tabs)/teachers` e `/(tabs)/students`)**: CRUD completo (listagem paginada, cadastro, edição e exclusão) de docentes e alunos para administração escolar.

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologias |
| :--- | :--- |
| **Mobile (Front-end)** | React Native `0.88`, Expo SDK `58`, Expo Router (File-based routing), TypeScript, Axios, Expo Secure Store |
| **Back-end (API REST)** | Node.js `22`, NestJS `10`, TypeORM, Passport JWT, Bcrypt, class-validator, Swagger (OpenAPI) |
| **Banco de Dados** | PostgreSQL `16` (Alpine) |
| **Infraestrutura & DevOps** | Docker, Docker Compose, Healthchecks automatizados |

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
1. **[Docker](https://www.docker.com/) e Docker Compose** (para subir o banco de dados PostgreSQL, a API Back-end e/ou o container do Expo).
2. **[Node.js](https://nodejs.org/)** (versão **20 LTS** ou **22 LTS** recomendada) e **npm**.
3. **Expo Go** instalado no seu smartphone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)) **ou** um emulador configurado (Android Studio / Xcode) **ou** navegador Web.

---

## 🚀 Guia de Setup Inicial (Passo a Passo)

### Passo 1 — Clonar o Repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd projecto-mobile-pos
```

### Passo 2 — Subir os Serviços com Docker Compose

#### Opção A — Subir toda a stack no Docker (Banco + Back-end + Mobile/Web)
Você pode subir todos os serviços (PostgreSQL + API NestJS + Servidor Expo/Metro) diretamente pela raiz do projeto com um único comando:

```bash
docker compose up -d --build
```

Após a inicialização dos containers, os serviços estarão imediatamente disponíveis em:
- **Aplicação Mobile (Versão Web)**: `http://localhost:8081`
- **API Back-end**: `http://localhost:3000`
- **Healthcheck da API**: `http://localhost:3000/health`
- **Documentação Interativa (Swagger)**: `http://localhost:3000/api-docs`

> 📱 **Testando no Celular Físico (Expo Go) via Container Docker**:
> Para que o QR Code gerado dentro do container aponte para o IP da sua máquina na rede Wi-Fi (e não para `localhost`), informe o IP local da sua máquina ao iniciar o container `mobile` e visualize o QR Code nos logs:
> ```bash
> REACT_NATIVE_PACKAGER_HOSTNAME=<SEU_IP_LOCAL> docker compose up -d mobile
> docker compose logs mobile
> ```

---

#### Opção B — Banco + Back-end no Docker e Expo CLI rodando localmente (Recomendado para Emuladores Android / Simulador iOS)
Caso prefira rodar o **PostgreSQL e o Back-end no Docker** e executar o **Expo CLI nativamente** no seu terminal (ideal para abrir diretamente no Emulador Android Studio, Simulador iOS ou usar o menu interativo do Metro Bundler):

1. Suba apenas o banco e a API no Docker (ou, se já subiu todos os containers na Opção A, pare o container `mobile` com `docker compose stop mobile` para liberar a porta `8081`):
   ```bash
   docker compose up -d --build db backend
   ```

2. Entre na pasta **`mobile/`**, instale as dependências e inicie o Expo:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```

No terminal interativo do Expo:
- Pressione **`w`** para abrir a versão **Web** no navegador (`http://localhost:8081`).
- Pressione **`a`** para abrir no **Emulador Android**.
- Pressione **`i`** para abrir no **Simulador iOS** (macOS).
- Ou escaneie o **QR Code** exibido no terminal utilizando a câmera (iOS) ou o app **Expo Go** (Android), garantindo que o computador e o celular estejam na mesma rede Wi-Fi.

> 🌐 **Configuração de Rede / URL da API (`EXPO_PUBLIC_API_URL`)**:
> O arquivo `mobile/src/services/api.ts` detecta automaticamente o IP da máquina host na rede local (via `Constants.expoConfig.hostUri`), `localhost:3000` na Web e `10.0.2.2:3000` no Emulador Android.
> Caso precise definir o endereço da API manualmente, informe a variável de ambiente:
> ```bash
> EXPO_PUBLIC_API_URL=http://<SEU_IP_LOCAL>:3000 npx expo start
> ```

---

## 🔑 Credenciais Padrão (Seed Automático)

Ao iniciar pela primeira vez, o back-end popula automaticamente o banco de dados com dois usuários padrão para avaliação imediata (também disponíveis nos botões de **Acesso Rápido** na tela de Login do app):

| Perfil | Usuário (`username`) | Senha (`password`) | Permissões no App |
| :--- | :--- | :--- | :--- |
| **Docente** | `professor` | `senha123` | Acesso total: criar/editar/excluir posts próprios, moderar comentários e gerenciar professores e estudantes |
| **Estudante** | `aluno` | `senha123` | Leitura e busca de postagens, criação e exclusão dos próprios comentários |

---

## 📂 Estrutura do Projeto

```text
projecto-mobile-pos/
├── docker-compose.yml            # Orquestração dos containers (db, backend e mobile)
├── README.md                     # Documentação principal centralizada do projeto
├── .gitignore                    # Regras de exclusão do Git
│
├── back-end/                     # API RESTful em Node.js + NestJS
│   ├── Dockerfile                # Build multi-stage da API NestJS
│   ├── package.json              # Dependências e scripts de teste/build do back-end
│   └── src/
│       ├── auth/                 # Autenticação JWT, Guards (JwtAuthGuard, RolesGuard) e Strategies
│       ├── posts/                # CRUD de postagens e busca por termo (/posts/search)
│       ├── comments/             # Comentários vinculados às postagens
│       ├── users/                # CRUD paginado de usuários (professores e alunos) + Seed inicial
│       ├── health.controller.ts  # Endpoint /health para monitoramento do Docker
│       ├── app.module.ts         # Módulo raiz e configuração do TypeORM/PostgreSQL
│       └── main.ts               # Bootstrap da aplicação, CORS, ValidationPipe e Swagger
│
├── mobile/                       # Aplicativo Mobile em React Native + Expo
│   ├── Dockerfile                # Containerização do servidor de desenvolvimento Expo/Metro
│   ├── app.json                  # Configurações do projeto Expo e plugins nativos
│   ├── package.json              # Dependências do aplicativo mobile
│   ├── app/                      # Rotas baseadas em arquivos (Expo Router)
│   │   ├── _layout.tsx           # Stack principal e proteção de rotas autenticadas
│   │   ├── login.tsx             # Tela de login com preenchimento rápido de credenciais
│   │   ├── (tabs)/               # Navegação em abas inferiores
│   │   │   ├── _layout.tsx       # Controle de abas visíveis por perfil (professor vs aluno)
│   │   │   ├── index.tsx         # Feed de postagens e barra de busca
│   │   │   ├── admin-posts.tsx   # Administração de postagens (Docentes)
│   │   │   ├── teachers.tsx      # Gestão de professores (Docentes)
│   │   │   └── students.tsx      # Gestão de estudantes (Docentes)
│   │   └── post/                 # Telas de detalhes, criação e edição de postagens
│   │       ├── [id].tsx          # Leitura da postagem e seção de comentários
│   │       ├── create.tsx        # Criação de nova postagem
│   │       └── edit/[id].tsx     # Edição de postagem existente
│   └── src/                      # Camada de arquitetura, estado e serviços
│       ├── components/           # Componentes reutilizáveis (UserCrudScreen)
│       ├── contexts/             # Contexto global de autenticação (AuthContext)
│       ├── services/             # Cliente Axios e interceptors JWT (api.ts)
│       └── types/                # Tipagens e contratos TypeScript
│
└── docs/                         # Documentação complementar de arquitetura
    └── arquitetura-mobile.md     # Detalhamento arquitetural, guia de uso e relato de desafios
```

---

## 📡 Principais Endpoints da API

A documentação completa e interativa pode ser acessada em `http://localhost:3000/api-docs`.

| Método | Rota | Autenticação / Perfil | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Público | Verifica a saúde da API (`{"status":"ok"}`) |
| `POST` | `/auth/login` | Público | Autentica o usuário e retorna o `access_token` JWT |
| `POST` | `/auth/register` | Público | Registra um novo usuário |
| `GET` | `/posts` | Bearer JWT (`professor` / `aluno`) | Lista todas as postagens ordenadas por data |
| `GET` | `/posts/search?q=termo` | Bearer JWT (`professor` / `aluno`) | Busca postagens por palavra-chave no título ou conteúdo |
| `GET` | `/posts/:id` | Bearer JWT (`professor` / `aluno`) | Retorna os detalhes completos de uma postagem |
| `POST` | `/posts` | Bearer JWT (`professor`) | Cria uma nova postagem |
| `PUT` | `/posts/:id` | Bearer JWT (`professor` autor) | Atualiza uma postagem existente |
| `DELETE` | `/posts/:id` | Bearer JWT (`professor` autor) | Exclui uma postagem existente |
| `GET` | `/posts/:postId/comments` | Bearer JWT (`professor` / `aluno`) | Lista os comentários de uma postagem |
| `POST` | `/posts/:postId/comments` | Bearer JWT (`professor` / `aluno`) | Adiciona um comentário à postagem |
| `PUT` | `/comments/:id` | Bearer JWT (Autor) | Edita um comentário próprio |
| `DELETE` | `/comments/:id` | Bearer JWT (Autor ou `professor`) | Remove um comentário |
| `GET` | `/users?role=&page=&limit=` | Bearer JWT (`professor`) | Lista usuários paginados filtrados por perfil |
| `POST` | `/users` | Bearer JWT (`professor`) | Cadastra um novo professor ou estudante |
| `PUT` | `/users/:id` | Bearer JWT (`professor`) | Atualiza dados ou senha de um usuário |
| `DELETE` | `/users/:id` | Bearer JWT (`professor`) | Remove um usuário do sistema |

---

## 🧪 Executando os Testes Automatizados (Back-end)

```bash
cd back-end
npm install
npm test
npm run test:cov
```
