# Site Lingua Solta

Projeto organizado em:

- `frontend/`: site publico em HTML, CSS e JavaScript
- `admin/`: painel administrativo conectado a API
- `backend/`: API Node.js + Express + MySQL
- `banco.sql`: estrutura do banco de dados e usuario inicial

## Credenciais iniciais

O banco cria um usuario administrativo inicial para a primeira instalacao.
Entre uma vez, altere a senha no banco/painel conforme sua rotina e nao mantenha credenciais padrao em producao.

## Como instalar

### 1. Banco de dados

Crie o banco importando o arquivo `banco.sql`.

### 2. Backend

Entre na pasta `backend` e rode:

```bash
npm install
```

Copie `.env.example` para `.env` e ajuste os dados do MySQL e seguranca:

```bash
cp .env.example .env
```

Variaveis importantes:

- `JWT_SECRET`: use um segredo longo e aleatorio em producao.
- `CORS_ORIGIN`: informe os dominios permitidos, separados por virgula.
- `UPLOAD_MAX_BYTES`: limite maximo para uploads.

Depois inicie:

```bash
npm run dev
```

A API ficara em `http://localhost:3000`.

### 3. Frontend e painel admin

Abra `frontend/index.html` e `admin/login.html` usando um servidor local, como Live Server, ou publique as pastas no mesmo dominio da API.

O frontend usa por padrao a API configurada em `frontend/js/config.js`.
O painel admin usa `/api` por padrao, mas tambem aceita `localStorage.site_admin_api_base` quando for necessario apontar para outra API.

## Observacoes importantes

- O formulario de contato grava as mensagens no banco.
- O painel permite cadastrar, editar e excluir projetos, galeria, banners, acoes e prestacao de contas.
- A pagina institucional `Quem Somos` e editada pelo painel.
- As imagens e documentos enviados sao salvos em `backend/uploads/`.
- Uploads agora sao limitados por tamanho e tipo de arquivo.
