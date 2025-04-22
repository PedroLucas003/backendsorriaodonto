require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Debug: Enhanced environment logging
console.log('=== Starting Server ===');
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  FRONTEND_URL: process.env.FRONTEND_URL,
  DB_CONNECTED: !!process.env.DB_FULL_URI,
  JWT_SECRET: process.env.JWT_SECRET ? '***' : 'missing'
});

const app = express();

// ====================
// Security Middlewares
// ====================
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ================
// CORS Configuration
// ================
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://soofront.vercel.app',
  'https://sorriaodontofn.com',
  'http://localhost:3000' // For local development
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      origin.includes(allowedOrigin.replace(/https?:\/\//, ''))
    )) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ================
// Rate Limiting
// ================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' // Disable in dev
});

app.use(limiter);

// ================
// Database Connection
// ================
require("./database/connection");

// ================
// Routes
// ================
const AuthRegisterUserRoutes = require("./routes/AuthRegisterUserRoutes");
app.use('/api', AuthRegisterUserRoutes);

// ================
// API Documentation Endpoint
// ================
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Sorria Odonto Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    documentation: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register/user',
        prontuario: 'POST /api/auth/prontuario'
      },
      users: {
        getAll: 'GET /api/auth/users',
        update: 'PUT /api/auth/users/:id',
        delete: 'DELETE /api/auth/users/:id'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Sorria Odonto Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    apiBaseUrl: '/api',
    documentation: {
      auth: {
        login: 'POST /api/login',
        register: 'POST /api/register/user',
        prontuario: 'POST /api/prontuario'
      },
      users: {
        getAll: 'GET /api/users',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id',
        addProcedure: 'PUT /api/users/:id/procedimento'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// ================
// Error Handlers
// ================
// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    message: "Endpoint not found",
    suggestion: "Try accessing /api/ endpoints or check the root / for documentation"
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    type: err.name,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ================
// Server Initialization
// ================
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`\n=== Server Started ===`);
  console.log(`Server: http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Allowed Origins: ${allowedOrigins.join(', ')}`);
  console.log(`Database: ${process.env.DB_FULL_URI ? 'Configured' : 'Not configured'}`);
  console.log(`=================================\n`);
});

// ================
// Process Management
// ================
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = app;