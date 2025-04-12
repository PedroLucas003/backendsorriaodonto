// backend/auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token não fornecido ou mal formatado." });
  }

  const token = authHeader.split(" ")[1]; // Remove o 'Bearer'

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido ou expirado." });

    req.userId = decoded.id;
    next();
  });
}

module.exports = verifyToken;