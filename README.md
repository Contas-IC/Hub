# Sistema Hub - CRM Integrado para Escritórios

## 📋 Visão Geral

O **Sistema Hub** é uma plataforma completa de CRM (Customer Relationship Management) desenvolvida para escritórios de contabilidade e assessoria jurídica. O sistema integra múltiplos módulos especializados para gerenciar todo o ciclo de vida dos clientes, desde a legalização até o atendimento contínuo nos setores contábil, fiscal e de departamento pessoal.

## ✨ Funcionalidades Principais

### 🔐 Autenticação e Controle de Acesso
- Sistema de login seguro com JWT
- Controle granular de permissões por módulo
- Perfis de usuário com diferentes níveis de acesso (ADMIN, LEGALIZAÇÃO, ONBOARDING, CONTÁBIL, FISCAL, DP)

### 🏢 Módulo de Legalização
- Cadastro completo de clientes (CNPJ, dados fiscais, contatos)
- Gestão de certificados digitais
- Controle financeiro (cobranças, vencimentos)
- Barra de progressão para acompanhar etapas do processo
- Sistema de solicitações de alteração de dados

### 🚀 Módulo de Onboarding
- Processo estruturado de entrada de novos clientes
- Agendamento e realização de reuniões
- Acompanhamento de tarefas e prazos
- Integração com sistema legado (Ondesk)

### 💼 Módulo Contábil
- Gestão de regime contábil
- Acompanhamento de status de atendimento
- Observações específicas do setor

### 📊 Módulo Fiscal
- Controle de regime fiscal
- Gestão de obrigações fiscais
- Histórico de atendimentos

### 👥 Módulo DP (Departamento Pessoal)
- Gestão de funcionários por cliente
- Controle de processos trabalhistas
- Acompanhamento de status

### 📈 Dashboard e Relatórios
- Visualização geral do sistema
- Gráficos e métricas em tempo real
- Relatórios de acompanhamento

## 🛠️ Tecnologias Utilizadas

### Frontend (Client)
- **React 19** - Framework JavaScript para interfaces
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento da aplicação
- **Tailwind CSS** - Framework CSS utilitário
- **Axios** - Cliente HTTP para APIs
- **Chart.js / Recharts** - Bibliotecas de gráficos
- **FullCalendar** - Componente de calendário
- **React DnD** - Drag and drop
- **Lucide React** - Ícones

### Backend (Server)
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite** - Banco de dados relacional
- **Better SQLite3** - Driver SQLite para Node.js
- **JWT** - Autenticação baseada em tokens
- **Bcrypt** - Hashing de senhas
- **Multer** - Upload de arquivos
- **CORS** - Controle de acesso cross-origin
- **Helmet** - Segurança de headers HTTP
- **Morgan** - Logging de requisições

### Desenvolvimento
- **ESLint** - Linting de código
- **Nodemon** - Auto-restart do servidor em desenvolvimento

## 📁 Estrutura do Projeto

```
hub/
├── client/                          # Frontend React
│   ├── public/                      # Assets estáticos
│   ├── src/
│   │   ├── components/              # Componentes reutilizáveis
│   │   │   ├── common/             # Componentes comuns
│   │   │   ├── Layout/             # Layout da aplicação
│   │   │   └── [Módulos]/          # Componentes específicos
│   │   ├── hooks/                  # Custom hooks
│   │   ├── pages/                  # Páginas da aplicação
│   │   │   ├── Auth/               # Páginas de autenticação
│   │   │   ├── Dashboard/          # Dashboard principal
│   │   │   ├── Legalizacao/        # Módulo Legalização
│   │   │   ├── Onboarding/         # Módulo Onboarding
│   │   │   ├── Contabil/           # Módulo Contábil
│   │   │   ├── Fiscal/             # Módulo Fiscal
│   │   │   ├── DP/                 # Módulo DP
│   │   │   └── Usuarios/           # Gestão de usuários
│   │   ├── services/               # Serviços de API
│   │   ├── utils/                  # Utilitários
│   │   └── App.jsx                 # Componente principal
│   ├── package.json
│   └── vite.config.js
├── server/                          # Backend Node.js
│   ├── src/
│   │   ├── app.js                  # Aplicação Express principal
│   │   ├── config/                 # Configurações
│   │   ├── controllers/            # Controladores da API
│   │   ├── middlewares/            # Middlewares customizados
│   │   ├── models/                 # Modelos de dados
│   │   ├── routes/                 # Definições de rotas
│   │   ├── scripts/                # Scripts utilitários
│   │   └── utils/                  # Utilitários do backend
│   ├── package.json
│   └── database/
│       └── hub.db                  # Banco de dados SQLite
├── db/
│   └── hub_schema.sql              # Schema do banco de dados
└── README.md                       # Este arquivo
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 👤 Usuários e Permissões
- `usuarios` - Dados dos usuários do sistema
- `permissoes_usuarios` - Controle de acesso por módulo

#### 🏢 Clientes
- `clientes` - Dados base dos clientes
- `cliente_emails` - Emails múltiplos por cliente

#### 📋 Módulos Específicos
- `clientes_legalizacao` - Dados específicos da legalização
- `clientes_onboarding` - Dados do processo de onboarding
- `clientes_contabil` - Dados do setor contábil
- `clientes_fiscal` - Dados do setor fiscal
- `clientes_dp` - Dados do departamento pessoal

#### 📊 Controle e Acompanhamento
- `barra_progressao` - Acompanhamento de progresso
- `solicitacoes_alteracao` - Sistema de solicitações
- `historico` - Log de alterações

#### 📅 Funcionalidades Legadas (Ondesk)
- `grupos` - Agrupamento de clientes
- `reunioes` - Agendamento de reuniões
- `relatorios` - Gestão de relatórios
- `acompanhamentos` - Sistema de tarefas

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### 1. Clonagem do Repositório
```bash
git clone <url-do-repositorio>
cd hub
```

### 2. Configuração do Backend
```bash
cd server
npm install
```

### 3. Inicialização do Banco de Dados
```bash
# Executar o script de inicialização
npm run migrate
# ou
node --experimental-sqlite src/scripts/inicializarBanco.js
```

### 4. Configuração do Frontend
```bash
cd ../client
npm install
```

### 5. Execução do Sistema

#### Desenvolvimento
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

#### Produção
```bash
# Backend
cd server
npm start

# Frontend (build)
cd client
npm run build
npm run preview
```

## 🔗 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/verify` - Verificação de token

### Usuários
- `GET /api/usuarios` - Listar usuários
- `POST /api/usuarios` - Criar usuário
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Excluir usuário

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Criar cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Excluir cliente

### Certificados
- `GET /api/certificados` - Listar certificados
- `POST /api/certificados` - Criar certificado
- `PUT /api/certificados/:id` - Atualizar certificado

### Configurações
- `GET /api/configuracoes` - Obter configurações
- `PUT /api/configuracoes` - Atualizar configurações

### Financeiro
- `GET /api/financeiro` - Dados financeiros
- `POST /api/financeiro` - Registrar transação

### Tarefas
- `GET /api/tarefas` - Listar tarefas
- `POST /api/tarefas` - Criar tarefa
- `PUT /api/tarefas/:id` - Atualizar tarefa

## 🔧 Scripts Disponíveis

### Client
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build
- `npm run lint` - Executa ESLint

### Server
- `npm start` - Inicia servidor em produção
- `npm run dev` - Inicia servidor com nodemon
- `npm run migrate` - Executa migração do banco

## 🔒 Segurança

- Autenticação JWT com expiração de token
- Hashing de senhas com bcrypt
- Controle de CORS
- Headers de segurança com Helmet
- Validação de entrada com express-validator
- Sanitização de dados

## 📊 Monitoramento e Logs

- Logging de requisições HTTP com Morgan
- Sistema de auditoria para alterações críticas
- Histórico completo de operações por usuário

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Padrões de Código
- Use ESLint para manter consistência
- Siga convenções de nomenclatura camelCase
- Documente funções e componentes importantes
- Mantenha commits descritivos

## 📝 Licença

Este projeto está sob a licença ISC.

## 👥 Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato com a equipe de desenvolvimento.

---

**Sistema Hub** - Transformando a gestão de escritórios com tecnologia integrada e eficiente.
