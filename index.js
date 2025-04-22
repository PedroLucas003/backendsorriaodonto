require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Debug: Log de inicialização
console.log('=== Iniciando Servidor ===');

const app = express();

// Middlewares de Segurança
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Configuração CORS (CORREÇÃO APLICADA)
const allowedOrigins = [
  'https://frontvercel.vercel.app', // URL do seu frontend
  'https://sorriaodontofn.com',
  'http://localhost:3000'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const originMatches = allowedOrigins.some(allowedOrigin => {
      return origin === allowedOrigin || 
             origin.includes(allowedOrigin.replace(/https?:\/\//, ''));
    });
    
    if (originMatches) {
      callback(null, true);
    } else {
      console.warn(`CORS bloqueado para origem: ${origin}`);
      callback(new Error('Não permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true
});
app.use(limiter);

// Conexão com Banco de Dados
require("./database/connection");

// Rotas
const AuthRegisterUserRoutes = require("./routes/AuthRegisterUserRoutes");
app.use('/api', AuthRegisterUserRoutes);

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
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});