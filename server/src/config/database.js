// arquivo: server/src/config/database.js
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

// Garantir que a pasta database existe
const dbDir = path.join(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'hub.db');

// Criar conexão com o banco
const db = new DatabaseSync(dbPath);

// Habilitar foreign keys
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA journal_mode = WAL');

console.log('✅ Banco de dados conectado:', dbPath);

// Função para executar queries preparadas
function query(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  } catch (error) {
    console.error('Erro ao executar query:', error);
    throw error;
  }
}

// Função para executar um único resultado
function get(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  } catch (error) {
    console.error('Erro ao executar get:', error);
    throw error;
  }
}

// Função para executar INSERT/UPDATE/DELETE
function run(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  } catch (error) {
    console.error('Erro ao executar run:', error);
    throw error;
  }
}

module.exports = {
  db,
  query,
  get,
  run
};
