const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

var app = express();
app.use(express.json());
app.use(cors());

// Servir arquivos estáticos da pasta "uploads"
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const AuthRegisterUserRoutes = require("./routes/AuthRegisterUserRoutes");
app.use(AuthRegisterUserRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`);
});

require("./database/connection");