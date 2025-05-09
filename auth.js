// backend/auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token não fornecido ou mal formatado." });
  }

  const token = authHeader.split(" ")[1];

  // Verificação que ignora a expiração
  jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true }, (err, decoded) => {
    if (err) {
      console.error("Erro na verificação do token:", err);
      return res.status(403).json({ message: "Token inválido." });
    }

    req.userId = decoded.id;
    next();
  });
}

module.exports = verifyToken;