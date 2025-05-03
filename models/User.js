const mongoose = require("mongoose");

// Schema para procedimentos (opcional)
const ProcedimentoSchema = new mongoose.Schema({
  dataProcedimento: { type: Date, required: true },
  procedimento: { type: String, required: true },
  denteFace: { type: String, required: true },
  profissional: { type: String, required: true },
  modalidadePagamento: { 
    type: String, 
    enum: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Convênio", "Boleto"],
    required: true 
  },
  valor: { type: Number, required: true, min: 0 }
}, { timestamps: true });

// Schema principal do usuário
const UserSchema = new mongoose.Schema({
  // ✅ Dados Pessoais (OBRIGATÓRIOS)
  nomeCompleto: { 
    type: String, 
    required: [true, "O nome completo é obrigatório"],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, "O email é obrigatório"],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/, "E-mail inválido"]
  },
  cpf: { 
    type: String, 
    required: [true, "O CPF é obrigatório"],
    unique: true,
    validate: {
      validator: (v) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v),
      message: "CPF no formato inválido (000.000.000-00)"
    }
  },
  telefone: { 
    type: String, 
    required: [true, "O telefone é obrigatório"],
    validate: {
      validator: (v) => /^\(\d{2}\) \d{4,5}-\d{4}$/.test(v),
      message: "Telefone no formato inválido (00) 00000-0000"
    }
  },
  endereco: { 
    type: String, 
    required: [true, "O endereço é obrigatório"],
    trim: true 
  },
  dataNascimento: { 
    type: Date, 
    required: [true, "A data de nascimento é obrigatória"],
    validate: {
      validator: (v) => v < new Date(),
      message: "Data de nascimento deve ser no passado"
    }
  },
  password: { 
    type: String, 
    required: [true, "A senha é obrigatória"],
    minlength: [6, "A senha deve ter pelo menos 6 caracteres"],
    select: false 
  },

  // ❌ Campos de Saúde (OPCIONAIS)
  detalhesDoencas: { type: String, trim: true }, // Opcional
  quaisRemedios: { type: String, trim: true },  // Opcional
  alergiaMedicamento: { type: String, trim: true }, // Opcional

  // ❌ Hábitos (OPCIONAIS)
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

  // ❌ Exames (OPCIONAIS)
  exames: {
    exameSangue: { type: String, trim: true }, // Opcional
    coagulacao: { type: String, trim: true },  // Opcional
    cicatrizacao: { type: String, trim: true } // Opcional
  },

  // ❌ Histórico Médico (OPCIONAIS)
  historicoCirurgia: { type: String, trim: true }, // Opcional
  historicoOdontologico: { type: String, trim: true }, // Opcional

  // ❌ Procedimento Principal (OPCIONAL)
  procedimento: { type: String, trim: true }, // Opcional
  denteFace: { type: String, trim: true },   // Opcional
  peso: { 
    type: Number,
    validate: {
      validator: (v) => !v || v > 0,
      message: "Peso deve ser positivo"
    }
  },
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
    enum: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Convênio", "Boleto", ""]
  },
  valor: { type: Number, min: 0 }, // Opcional
  profissional: { type: String, trim: true }, // Opcional

  // ❌ Histórico de Procedimentos (OPCIONAL)
  historicoProcedimentos: [ProcedimentoSchema], // Array opcional

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