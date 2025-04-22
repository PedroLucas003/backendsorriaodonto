const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// Configurações de Segurança
app.use(helmet());

// Configuração do CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://soofront.vercel.app',
  'https://sorriaodontofn.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Limitação de taxa
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Configurações do Express
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rotas
const AuthRegisterUserRoutes = require("./routes/AuthRegisterUserRoutes");
app.use('/api', AuthRegisterUserRoutes); // Adicionei prefixo /api

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint não encontrado" });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erro interno do servidor" });
});

// Conexão com o banco de dados
require("./database/connection");

// Não precisamos mais do app.listen para o Vercel
module.exports = app;