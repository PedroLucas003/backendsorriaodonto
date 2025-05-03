const mongoose = require("mongoose");

// Schema para procedimentos
const ProcedimentoSchema = new mongoose.Schema({
  dataProcedimento: { type: Date },
  procedimento: { type: String },
  denteFace: { type: String },
  profissional: { type: String },
  modalidadePagamento: { 
    type: String, 
    enum: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Convênio", "Boleto", ""],
    default: ""
  },
  valor: { type: Number, min: 0 }
}, { timestamps: true });

// Schema principal do usuário
const UserSchema = new mongoose.Schema({
  // Dados Pessoais (todos opcionais agora)
  nomeCompleto: { 
    type: String, 
    trim: true 
  },
  email: { 
    type: String, 
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/, "E-mail inválido"]
  },
  cpf: { 
    type: String, 
    unique: true,
    validate: {
      validator: (v) => !v || /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v),
      message: "CPF no formato inválido (000.000.000-00)"
    }
  },
  telefone: { 
    type: String,
    validate: {
      validator: (v) => !v || /^\(\d{2}\) \d{4,5}-\d{4}$/.test(v),
      message: "Telefone no formato inválido (00) 00000-0000"
    }
  },
  endereco: { 
    type: String, 
    trim: true 
  },
  dataNascimento: { 
    type: Date,
    validate: {
      validator: (v) => !v || v < new Date(),
      message: "Data de nascimento deve ser no passado"
    }
  },
  password: { 
    type: String, 
    select: false 
  },

  // Campos de Saúde
  detalhesDoencas: { type: String, trim: true },
  quaisRemedios: { type: String, trim: true },
  quaisMedicamentos: { type: String, trim: true },
  quaisAnestesias: { type: String, trim: true },

  // Hábitos
  habitos: {
    frequenciaFumo: { 
      type: String,
      enum: ["Nunca", "Ocasionalmente", "Frequentemente", "Diariamente", ""],
      default: ""
    },
    frequenciaAlcool: { 
      type: String,
      enum: ["Nunca", "Ocasionalmente", "Frequentemente", "Diariamente", ""],
      default: ""
    }
  },

  // Exames
  exames: {
    exameSangue: { type: String, trim: true },
    coagulacao: { type: String, trim: true },
    cicatrizacao: { type: String, trim: true }
  },

  // Histórico Médico
  historicoCirurgia: { type: String, trim: true },
  historicoOdontologico: { type: String, trim: true },
  sangramentoPosProcedimento: { type: String, trim: true },
  respiracao: { type: String, trim: true },
  peso: { 
    type: Number,
    validate: {
      validator: (v) => !v || v > 0,
      message: "Peso deve ser positivo"
    }
  },

  // Procedimento Principal
  procedimento: { type: String, trim: true },
  denteFace: { type: String, trim: true },
  dataProcedimento: { 
    type: Date,
    validate: {
      validator: function(v) {
        if (!v || !this.dataNascimento) return true;
        return v > this.dataNascimento;
      },
      message: "Data do procedimento deve ser após o nascimento"
    }
  },
  modalidadePagamento: { 
    type: String,
    enum: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Convênio", "Boleto", ""],
    default: ""
  },
  valor: { type: Number, min: 0 },
  profissional: { type: String, trim: true },

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
UserSchema.index({ "historicoProcedimentos.dataProcedimento": 1 });

// Virtuals (campos calculados)
UserSchema.virtual("idade").get(function() {
  if (!this.dataNascimento) return null;
  const today = new Date();
  const birthDate = new Date(this.dataNascimento);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

module.exports = mongoose.model("User", UserSchema);