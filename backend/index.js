const express = require("express");
const cors = require("cors");

require("dotenv").config()

var app = express();
app.use(express.json())

app.use(cors())

const AuthRegisterUserRoutes = require("./routes/AuthRegisterUserRoutes")

app.use(AuthRegisterUserRoutes)

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`)
})



require("./database/connection")