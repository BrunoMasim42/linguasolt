
CREATE DATABASE IF NOT EXISTS site_linguasolta CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE site_linguasolta;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  tipo ENUM('admin','editor') DEFAULT 'admin',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS paginas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  conteudo LONGTEXT,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150),
  imagem VARCHAR(255),
  link VARCHAR(255),
  ordem INT DEFAULT 0,
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS acoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT,
  imagem VARCHAR(255),
  link VARCHAR(255),
  ordem INT DEFAULT 0,
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projetos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  autor VARCHAR(100),
  resumo TEXT,
  conteudo LONGTEXT,
  imagem VARCHAR(255),
  categoria VARCHAR(100),
  publicado TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS galeria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150),
  imagem VARCHAR(255),
  descricao TEXT,
  ordem INT DEFAULT 0,
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prestacao_contas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  arquivo VARCHAR(255),
  ano YEAR,
  mes VARCHAR(20),
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contatos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  mensagem TEXT NOT NULL,
  lido TINYINT(1) DEFAULT 0,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nome, email, senha, tipo)
SELECT 'Administrador', 'admin@linguasolta.org', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@linguasolta.org');

INSERT INTO acoes (titulo, descricao, imagem, link, ordem, ativo)
SELECT * FROM (
  SELECT 'Educação', 'Formação, reforço escolar e incentivo ao aprendizado para crianças, jovens e adultos.', '/uploads/acao-educacao.jpg', '#', 1, 1
  UNION ALL SELECT 'Saúde', 'Ações preventivas, atendimento comunitário e orientação voltada ao bem-estar social.', '/uploads/acao-saude.jpg', '#', 2, 1
  UNION ALL SELECT 'Cultura', 'Oficinas, arte, identidade local e valorização da participação comunitária.', '/uploads/acao-cultura.jpg', '#', 3, 1
  UNION ALL SELECT 'Assistência', 'Programas de apoio às famílias em situação de vulnerabilidade e inclusão social.', '/uploads/acao-assistencia.jpg', '#', 4, 1
  UNION ALL SELECT 'Esporte', 'Atividades esportivas que fortalecem disciplina, convivência e qualidade de vida.', '/uploads/acao-esporte.jpg', '#', 5, 1
  UNION ALL SELECT 'Formação', 'Capacitação e preparação para ampliar oportunidades e gerar autonomia na comunidade.', '/uploads/acao-formacao.jpg', '#', 6, 1
) AS sementes
WHERE NOT EXISTS (SELECT 1 FROM acoes);

INSERT INTO paginas (titulo, slug, conteudo)
SELECT 'Quem Somos', 'quem-somos', '<p>O Instituto Língua Solta atua com foco em transformação social, desenvolvimento humano e fortalecimento comunitário.</p><p>Com o novo sistema, este texto pode ser atualizado diretamente pelo painel administrativo, sem editar o HTML manualmente.</p>'
WHERE NOT EXISTS (SELECT 1 FROM paginas WHERE slug = 'quem-somos');
