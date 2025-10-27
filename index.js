require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const path = require('path');
const fs = require('fs'); 

console.log('=== Iniciando Servidor ===');

// Configurações iniciais
const app = express();
const PORT = process.env.PORT || 4000;

// =============================================
//         CRIAÇÃO DA PASTA DE UPLOADS
// =============================================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('✅ Pasta "uploads" criada com sucesso.');
}

// =============================================
//                 MIDDLEWARES
// =============================================

// Segurança
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logs de requisições
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log('🔍 Modo desenvolvimento: logs detalhados ativados');
}

// Configuração CORS
const allowedOrigins = [
  'https://frontvercel.vercel.app',
  'https://frontendsorriaodonto.vercel.app',
  'https://sorriaodontofn.com',
  'https://www.sorriaodontofn.com', // <-- ADICIONE ESTA LINHA
  'http://localhost:3000',
  'http://localhost:4000',
  'https://newsorriaodontopage.vercel.app',
  'http://localhost:8080'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS bloqueado para origem: ${origin}`);
      callback(new Error('Não permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Muitas requisições deste IP. Tente novamente mais tarde."
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);


// =============================================
//      ROTA ESTÁTICA PARA SERVIR ARQUIVOS
// =============================================
app.use('/uploads', express.static(uploadsDir));
console.log(`📂 Servindo arquivos estáticos de: ${uploadsDir}`);


// =============================================
//                 BANCO DE DADOS
// =============================================
require("./database/connection");
console.log('✅ Conexão com o banco de dados estabelecida');

// =============================================
//                     ROTAS
// =============================================
const AuthRegisterUserRoutes = require("./routes/AuthRegisterUserRoutes");
app.use('/api', AuthRegisterUserRoutes);

// Log de rotas acessadas (OPCIONAL, PODE SER REMOVIDO SE QUISER)
app.use((req, res, next) => {
  // Este log só vai rodar para rotas que não foram capturadas acima, como a rota de status
  console.log(`📦 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// =============================================
//                 ROTA DE STATUS
// =============================================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    service: 'Sorria Odonto Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      login: 'POST /api/login',
      register: 'POST /api/register/user',
      users: 'GET /api/users'
    }
  });
});

// =============================================
//               TRATAMENTO DE ERROS
// =============================================

// Rota não encontrada
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    message: `Endpoint não encontrado: ${req.method} ${req.originalUrl}`,
    code: "NOT_FOUND"
  });
});

// Erros globais
app.use((err, req, res, next) => {
  console.error('💥 ERRO:', err.stack);
  
  if (err.message === 'Não permitido por CORS') {
    return res.status(403).json({
      success: false,
      message: "Acesso não autorizado (CORS)",
      code: "CORS_BLOCKED"
    });
  }

  res.status(500).json({ 
    success: false,
    message: "Erro interno do servidor",
    code: "INTERNAL_ERROR",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// =============================================
//                  INICIALIZAÇÃO
// =============================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🕒 ${new Date().toLocaleString()}`);
});