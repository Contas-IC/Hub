// arquivo: server/src/scripts/inicializarBanco.js
const { db } = require('../config/database');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

console.log('🔧 Inicializando banco de dados...');

// Ler o schema SQL
const schemaPath = path.join(__dirname, '../../../db/hub_schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

try {
  // Executar schema
  db.exec(schema);
  console.log('✅ Tabelas criadas com sucesso!');

  // Criar usuário admin padrão
  const senhaHash = bcrypt.hashSync('admin123', 10);
  
  db.prepare(`
    INSERT OR IGNORE INTO usuarios (id, nome, email, senha_hash, cargo, ativo)
    VALUES (1, 'Administrador', 'admin@hub.com', ?, 'admin', 1)
  `).run(senhaHash);

  console.log('✅ Usuário admin criado!');
  console.log('   Email: admin@hub.com');
  console.log('   Senha: admin123');
  console.log('');
  console.log('🎉 Banco de dados inicializado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao inicializar banco:', error);
  process.exit(1);
}
