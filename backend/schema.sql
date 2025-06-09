-- DROP TABLES (temporariamente para garantir limpeza em desenvolvimento)
-- Use estas linhas para recriar as tabelas do zero, o que é útil durante o desenvolvimento.
-- Em produção, você faria migrações incrementais.
DROP TABLE IF EXISTS pagamentos CASCADE;
DROP TABLE IF EXISTS vendas CASCADE;
-- Se você quiser recriar clientes e usuários também (cuidado com dados de teste!),
-- descomente as linhas abaixo:
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;


-- Criação da tabela de usuários (com campo 'role' adicionado)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  role TEXT DEFAULT 'vendedor' NOT NULL, -- Adicionado: Define o perfil do usuário (admin, gerente, vendedor)
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de clientes (campos de valor e pagamento removidos, adicionados CPF/CNPJ, Email, Endereço)
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE, -- Usuário que cadastrou o cliente
  nome_cliente TEXT NOT NULL,
  cpf_cnpj TEXT UNIQUE, -- Adicionado: Pode ser CPF ou CNPJ. UNIQUE para evitar duplicação.
  telefone TEXT,
  email TEXT, -- Adicionado
  endereco TEXT, -- Adicionado: Campo para endereço completo
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOVA TABELA: vendas (para registrar cada transação/compra do cliente)
CREATE TABLE IF NOT EXISTS vendas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE, -- ID do cliente que fez a compra
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE, -- ID do usuário que registrou a venda
  valor_total NUMERIC(10, 2) NOT NULL, -- Valor total da venda
  valor_pago NUMERIC(10, 2) DEFAULT 0, -- Quanto já foi pago da venda
  -- CORREÇÃO APLICADA AQUI:
  valor_devido NUMERIC(10, 2) GENERATED ALWAYS AS (valor_total - valor_pago) STORED, -- Valor restante (calculado e armazenado)
  data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_vencimento DATE, -- Data de vencimento se a venda for a prazo
  forma_pagamento TEXT, -- Ex: 'Dinheiro', 'Cartão', 'Pix', 'Crediário'
  status_venda TEXT DEFAULT 'Aberta', -- Ex: 'Aberta', 'Paga', 'Parcialmente Paga', 'Vencida'
  observacoes_venda TEXT,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Para rastrear a última modificação da venda
);

-- Opcional: Tabela para registrar pagamentos parciais de uma venda (se precisar de histórico de cada pagamento)
CREATE TABLE IF NOT EXISTS pagamentos (
  id SERIAL PRIMARY KEY,
  venda_id INTEGER REFERENCES vendas(id) ON DELETE CASCADE, -- ID da venda a que este pagamento se refere
  valor_pago NUMERIC(10, 2) NOT NULL,
  data_pagamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  forma_pagamento TEXT,
  observacoes TEXT
);

-- Índices para otimizar consultas (opcional, mas recomendado para performance)
CREATE INDEX IF NOT EXISTS idx_clientes_usuario_id ON clientes (usuario_id);
CREATE INDEX IF NOT EXISTS idx_clientes_nome_cliente ON clientes (nome_cliente);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_id ON vendas (cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_usuario_id ON vendas (usuario_id);
