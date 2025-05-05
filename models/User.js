const mongoose = require("mongoose");

// Schema para procedimentos
const ProcedimentoSchema = new mongoose.Schema({
  procedimento: { type: String, required: true },
  denteFace: { type: String, required: true },
  profissional: { type: String, required: true },
  modalidadePagamento: { 
    type: String, 
    enum: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Convênio", "Boleto"],
    required: true
  },
  valor: { type: Number, min: 0, required: true }
}, { timestamps: true });

// Schema principal do usuário
const UserSchema = new mongoose.Schema({
  // Dados Pessoais (campos obrigatórios)
  nomeCompleto: { 
    type: String, 
    trim: true,
    required: [true, "Nome completo é obrigatório"]
  },
  email: { 
    type: String, 
    unique: true,
    lowercase: true,
    required: [true, "E-mail é obrigatório"],
    match: [/^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/, "E-mail inválido"]
  },
  cpf: { 
    type: String, 
    unique: true,
    required: [true, "CPF é obrigatório"],
    validate: {
      validator: (v) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v),
      message: "CPF no formato inválido (000.000.000-00)"
    }
  },
  telefone: { 
    type: String,
    required: [true, "Telefone é obrigatório"],
    validate: {
      validator: (v) => /^\(\d{2}\) \d{4,5}-\d{4}$/.test(v),
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
      validator: function(v) {
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

  // Campos de Saúde (obrigatórios)
  detalhesDoencas: { 
    type: String, 
    trim: true,
    required: [true, "Detalhes de doenças é obrigatório"]
  },
  quaisRemedios: { 
    type: String, 
    trim: true,
    required: [true, "Quais remédios é obrigatório"]
  },
  quaisMedicamentos: { 
    type: String, 
    trim: true,
    required: [true, "Quais medicamentos é obrigatório"]
  },
  quaisAnestesias: { 
    type: String, 
    trim: true,
    required: [true, "Quais anestesias é obrigatório"]
  },

  // Hábitos (obrigatórios)
  habitos: {
    frequenciaFumo: { 
      type: String,
      enum: ["Nunca", "Ocasionalmente", "Frequentemente", "Diariamente"],
      required: [true, "Frequência de fumo é obrigatória"]
    },
    frequenciaAlcool: { 
      type: String,
      enum: ["Nunca", "Ocasionalmente", "Frequentemente", "Diariamente"],
      required: [true, "Frequência de álcool é obrigatória"]
    }
  },

  // Exames (obrigatórios)
  exames: {
    exameSangue: { 
      type: String, 
      trim: true,
      required: [true, "Exame de sangue é obrigatório"]
    },
    coagulacao: { 
      type: String, 
      trim: true,
      required: [true, "Coagulação é obrigatório"]
    },
    cicatrizacao: { 
      type: String, 
      trim: true,
      required: [true, "Cicatrização é obrigatório"]
    }
  },

  // Histórico Médico (obrigatórios)
  historicoCirurgia: { 
    type: String, 
    trim: true,
    required: [true, "Histórico de cirurgia é obrigatório"]
  },
  historicoOdontologico: { 
    type: String, 
    trim: true,
    required: [true, "Histórico odontológico é obrigatório"]
  },
  sangramentoPosProcedimento: { 
    type: String, 
    trim: true,
    required: [true, "Sangramento pós-procedimento é obrigatório"]
  },
  respiracao: { 
    type: String, 
    trim: true,
    required: [true, "Respiração é obrigatório"]
  },
  peso: { 
    type: Number,
    min: 0,
    required: [true, "Peso é obrigatório"]
  },

  // Procedimento Principal (obrigatório)
  procedimento: { 
    type: String, 
    trim: true,
    required: [true, "Procedimento é obrigatório"]
  },
  denteFace: { 
    type: String, 
    trim: true,
    required: [true, "Dente/Face é obrigatório"]
  },
  valor: { 
    type: Number, 
    min: 0,
    required: [true, "Valor é obrigatório"]
  },
  modalidadePagamento: { 
    type: String,
    enum: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Convênio", "Boleto"],
    required: [true, "Modalidade de pagamento é obrigatória"]
  },
  profissional: { 
    type: String, 
    trim: true,
    required: [true, "Profissional é obrigatório"]
  },

  // Histórico de Procedimentos
  historicoProcedimentos: [ProcedimentoSchema],

  // Imagem
  image: { type: String },

  // Controle de acesso
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

// Índices para performance
UserSchema.index({ cpf: 1, email: 1 });

module.exports = mongoose.model("User", UserSchema);