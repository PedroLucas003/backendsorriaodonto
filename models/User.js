const mongoose = require("mongoose");

// Schema para procedimentos (sem alteração aqui)
const ProcedimentoSchema = new mongoose.Schema({
  procedimento: { type: String, required: true },
  denteFace: { type: String, required: true },
  profissional: { type: String, required: true },
  modalidadePagamento: {
    type: String,
    enum: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Convênio", "Boleto"],
    required: true
  },
  valor: { type: Number, min: 0, required: true },
  dataProcedimento: { type: Date, required: false }, // Data efetiva do procedimento, pode ser igual a dataNovoProcedimento
  dataNovoProcedimento: { type: Date, required: true } // Usado como data principal do procedimento no histórico
}, { timestamps: true });

// Schema principal do usuário
const UserSchema = new mongoose.Schema({
  // Dados Pessoais (campos obrigatórios)
  nomeCompleto: {
    type: String,
    trim: true,
    required: [true, "Nome completo é obrigatório"]
  },
  cpf: {
    type: String,
    unique: true,
    required: [true, "CPF é obrigatório"],
    validate: {
      validator: (v) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v), // Manter consistência com formatação do frontend
      message: "CPF no formato inválido (000.000.000-00)"
    }
  },
  telefone: {
    type: String,
    required: [true, "Telefone é obrigatório"],
    validate: {
      validator: (v) => /^\(\d{2}\) \d{4,5}-\d{4}$/.test(v), // Manter consistência
      message: "Telefone no formato inválido (00) 00000-0000"
    }
  },
  endereco: {
    type: String,
    trim: true,
    required: [true, "Endereço é obrigatório"]
  },
  dataNascimento: {
    type: Date,
    required: [true, "Data de nascimento é obrigatória"],
    validate: {
      validator: function (v) {
        return v < new Date();
      },
      message: "Data de nascimento deve ser no passado"
    }
  },
  password: {
    type: String,
    select: false,
    required: [true, "Senha é obrigatória"]
  },

  // Campos de Saúde (obrigatórios) - Mantidos como obrigatórios
  detalhesDoencas: { type: String, trim: true, required: [true, "Detalhes de doenças é obrigatório"] },
  quaisRemedios: { type: String, trim: true, required: [true, "Quais remédios é obrigatório"] },
  quaisMedicamentos: { type: String, trim: true, required: [true, "Quais medicamentos é obrigatório"] },
  quaisAnestesias: { type: String, trim: true, required: [true, "Quais anestesias é obrigatório"] },
  habitos: {
    frequenciaFumo: { type: String, enum: ["Nunca", "Ocasionalmente", "Frequentemente", "Diariamente"], required: [true, "Frequência de fumo é obrigatória"] },
    frequenciaAlcool: { type: String, enum: ["Nunca", "Ocasionalmente", "Frequentemente", "Diariamente"], required: [true, "Frequência de álcool é obrigatória"] }
  },
  exames: {
    exameSangue: { type: String, trim: true, required: [true, "Exame de sangue é obrigatório"] },
    coagulacao: { type: String, trim: true, required: [true, "Coagulação é obrigatório"] },
    cicatrizacao: { type: String, trim: true, required: [true, "Cicatrização é obrigatório"] }
  },
  historicoCirurgia: { type: String, trim: true, required: [true, "Histórico de cirurgia é obrigatório"] },
  historicoOdontologico: { type: String, trim: true, required: [true, "Histórico odontológico é obrigatório"] },
  sangramentoPosProcedimento: { type: String, trim: true, required: [true, "Sangramento pós-procedimento é obrigatório"] },
  respiracao: { type: String, trim: true, required: [true, "Respiração é obrigatório"] },
  peso: { type: Number, min: 0, required: [true, "Peso é obrigatório"] },

  // Campos do "Procedimento Principal" - TORNADOS OPCIONAIS
  procedimento: { type: String, trim: true, required: false },
  denteFace: { type: String, trim: true, required: false },
  valor: { type: Number, min: 0, required: false },
  modalidadePagamento: {
    type: String,
    enum: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Convênio", "Boleto"],
    required: false // Alterado
  },
  profissional: { type: String, trim: true, required: false },
  dataProcedimento: { type: Date, required: false }, // Já era opcional, mantido
  dataNovoProcedimento: { type: Date, required: false }, // Alterado (este era para o procedimento principal)

  // Histórico de Procedimentos (array de ProcedimentoSchema)
  historicoProcedimentos: [ProcedimentoSchema],

  image: { type: String },
  role: {
    type: String,
    enum: ["user", "admin", "medico"],
    default: "user"
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.password;
      return ret;
    }
  }
});

module.exports = mongoose.model("User", UserSchema);