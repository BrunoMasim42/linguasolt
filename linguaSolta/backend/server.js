require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Origem nao permitida pelo CORS.'));
  }
}));

app.use(express.json({
  limit: process.env.JSON_LIMIT || '2mb'
}));

app.use(express.urlencoded({
  extended: true,
  limit: process.env.FORM_LIMIT || '2mb'
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  fallthrough: false,
  maxAge: '7d',
  setHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

/* ============================================
   ROTA PRINCIPAL
============================================ */

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'API Site Lingua Solta online.'
  });
});

/* ============================================
   ROTAS DA API
============================================ */

app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/contatos', require('./routes/contatosRoutes'));

app.use('/api/paginas', require('./routes/paginasRoutes'));

app.use('/api/projetos', require('./routes/projetosRoutes'));

app.use('/api/galeria', require('./routes/galeriaRoutes'));

app.use('/api/banners', require('./routes/bannersRoutes'));

app.use('/api/acoes', require('./routes/acoesRoutes'));

app.use('/api/prestacao-contas', require('./routes/prestacaoRoutes'));

app.use('/api/equipe', require('./routes/equipeRoutes'));

app.use("/api/associados", require("./routes/associadosRoutes"));

/* ============================================
   NOVA ROTA - CREDENCIADOS
============================================ */

app.use('/api/credenciados', require('./routes/credenciadosRoutes'));

/* ============================================
   TRATAMENTO DE ERROS
============================================ */

app.use((error, _req, res, _next) => {

  if (error instanceof multer.MulterError) {

    return res.status(400).json({

      erro: error.code === 'LIMIT_FILE_SIZE'
        ? 'Arquivo muito grande.'
        : error.message

    });

  }

  if (error.message === 'Tipo de arquivo nao permitido.') {

    return res.status(400).json({

      erro: error.message

    });

  }

  if (error.message === 'Origem nao permitida pelo CORS.') {

    return res.status(403).json({

      erro: error.message

    });

  }

  console.error(error);

  return res.status(500).json({

    erro: 'Erro interno do servidor.'

  });

});

/* ============================================
   INICIALIZAÇÃO DO SERVIDOR
============================================ */

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {

  console.log(`
=========================================
   SERVIDOR LÍNGUA SOLTA
=========================================
API: http://localhost:${PORT}

Rotas disponíveis:

✔ Auth
✔ Contatos
✔ Páginas
✔ Projetos
✔ Galeria
✔ Banners
✔ Ações
✔ Prestação de Contas
✔ Credenciados

=========================================
`);

});