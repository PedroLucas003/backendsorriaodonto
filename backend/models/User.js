const mongoose = require("mongoose");

const User = mongoose.model("User", {
  nome: String,
  email: String,
  idade: String,
  image: String,
  password: String,
  fone: String,
  rg: String,
  sexo: String,
  cpf: String,
  endereco: String,
  possuiAlgumaDoencaAtualmente: String,
  tratamentoMedico: String, 
  medicacaoAtualmente: String,
  alergiaRemedio: String,
  historicoDoenca: String,
  condicoesHemograma: String,
  historicoProcedimentoOdontologico: String,
//   data: Date,
  procedimento: String,
  denteface: String,
  valor: String,
  modalidade: String,
  profissional: String

});

module.exports = User;
