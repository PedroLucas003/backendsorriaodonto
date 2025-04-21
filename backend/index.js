const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// 1. Configurações de Segurança
app.use(helmet()); // Adiciona vários headers de segurança

// 2. Configuração do CORS para produção/desenvolvimento
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'https://sorriaodontofn.com'
    : 'http://localhost:3001',

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  maxAge: 86400 // Cache de pré-voo por 24 horas
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Habilita preflight para todas as rotas

// 3. Limitação de taxa para prevenir ataques de força bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 4. Configurações do Express
app.use(express.json({ limit: '10kb' })); // Limita o tamanho do JSON
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Servir arquivos estáticos com cache control
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  maxAge: '1d', // Cache de 1 dia para arquivos estáticos
  setHeaders: (res, path) => {
    if (path.endsWith('.pdf')) {
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// 6. Rotas
const AuthRegisterUserRoutes = require("./routes/AuthRegisterUserRoutes");
app.use(AuthRegisterUserRoutes);

// 7. Middleware para rotas não encontradas
app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint não encontrado" });
});

// 8. Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erro interno do servidor" });
});

// 9. Conexão com o banco de dados
require("./database/connection");

// 10. Inicialização do servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'Não configurado'}`);
});