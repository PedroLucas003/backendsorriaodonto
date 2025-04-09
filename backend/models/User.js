const mongoose = require("mongoose");

const User = mongoose.model("User", {
  // Dados pessoais (substituindo os antigos)
  nomeCompleto: String,
  email: String,
  cpf: String,
  telefone: String,
  endereco: String,
  dataNascimento: Date,
  image: String,
  password: String,
  
  // Campos de saúde (substituindo os antigos)
  detalhesDoencas: String,
  quaisRemedios: String,
  quaisAnestesias: String,
  frequenciaFumo: String,
  frequenciaAlcool: String,
  
  // Informações médicas (substituindo os antigos)
  historicoCirurgia: String,
  exameSangue: String,
  coagulacao: String,
  cicatrizacao: String,
  historicoOdontologico: String,
  sangramentoPosProcedimento: String,
  respiracao: String,
  peso: String,
  
  // Procedimento (substituindo os antigos)
  profissional: String,
  dataProcedimento: Date,
  modalidadePagamento: String,
  valor: String
});

module.exports = User;