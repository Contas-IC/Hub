// arquivo: server/src/middlewares/auth.js

const jwt = require('jsonwebtoken');
const { get } = require('../config/database');

module.exports = (req, res, next) => {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Formato: "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    const token = parts[1];

    // Verificar token
    const secret = process.env.JWT_SECRET || 'hub-dev-secret';
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
      }

      // Buscar usuário no banco
      const usuario = get('SELECT * FROM usuarios WHERE id = ? AND ativo = 1', [decoded.id]);

      if (!usuario) {
        return res.status(401).json({ message: 'Usuário não encontrado ou inativo' });
      }

      // Adicionar usuário ao request
      req.usuario = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo
      };

      next();
    });

  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ message: 'Erro na autenticação' });
  }
};
