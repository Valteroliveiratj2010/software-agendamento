-- Criação da tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  nome_cliente TEXT NOT NULL,
  telefone TEXT,
  valor_total NUMERIC NOT NULL,
  valor_pago NUMERIC NOT NULL,
  valor_em_aberto NUMERIC,
  status_pagamento TEXT,
  observacoes TEXT,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
