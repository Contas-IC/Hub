// arquivo: server/src/middlewares/auth.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  try {
    // Pegar token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    // Formato: "Bearer TOKEN"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    const token = parts[1];

    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      }

      // Adicionar dados do usuário na request
      req.usuarioId = decoded.id;
      req.usuarioEmail = decoded.email;
      req.usuarioCargo = decoded.cargo;
      req.usuarioNome = decoded.nome;
      
      return next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao validar token',
      error: error.message
    });
  }
}

module.exports = authMiddleware;
