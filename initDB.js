const fs = require('fs');
const path = require('path');
const pool = require('./database');

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');

pool.query(schema)
  .then(() => {
    console.log('✅ Tabelas criadas com sucesso!');
    pool.end(); // Encerra a conexão
  })
  .catch(err => {
    console.error('❌ Erro ao criar tabelas:', err);
    pool.end();
  });
