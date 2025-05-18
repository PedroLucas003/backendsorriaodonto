require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

console.log('=== Iniciando Servidor ===');

const app = express();

// Middlewares de Segurança
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Configuração CORS - Versão Corrigida
const allowedOrigins = [
  'https://frontvercel.vercel.app', // SEU FRONTEND ATUAL
  'https://frontendsorriaodonto.vercel.app',
  'https://sorriaodontofn.com',
  'http://localhost:3000', // Frontend local
  'http://localhost:4000'  // Backend local
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requisições sem origem (como mobile apps ou curl)
    if (!origin) return callback(null, true);
    
    // Verificar se a origem está na lista de permitidas
    if (allowedOrigins.some(allowedOrigin => {
      return origin === allowedOrigin || 
             origin.includes(allowedOrigin.replace(/https?:\/\//, ''));
    })) {
      return callback(null, true);
    }
    
    console.warn(`⚠️ CORS bloqueado para origem: ${origin}`);
    callback(new Error('Não permitido por CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200 // Para navegadores mais antigos
};

// Aplicar CORS apenas uma vez
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Habilitar preflight para todas as rotas

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Conexão com Banco de Dados
require("./database/connection");

// Rotas
const AuthRegisterUserRoutes = require("./routes/AuthRegisterUserRoutes");
app.use('/api', AuthRegisterUserRoutes);

app.use((req, res, next) => {
  console.log(`📦 Rota acessada: ${req.method} ${req.originalUrl}`);
  next();
});

// Documentação da API
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Sorria Odonto Backend',
    version: '1.0.0',
    endpoints: {
      login: 'POST /api/login',
      register: 'POST /api/register/user',
      users: 'GET /api/users'
    }
  });
});

// Tratamento de Erros
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint não encontrado" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erro interno do servidor" });
});

// Inicialização do Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});