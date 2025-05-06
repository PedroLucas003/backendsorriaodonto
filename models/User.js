const mongoose = require("mongoose");

// Schema para procedimentos (atualizado)
const ProcedimentoSchema = new mongoose.Schema({
  procedimento: { 
    type: String, 
    required: [true, "Procedimento é obrigatório"] 
  },
  denteFace: { 
    type: String, 
    required: [true, "Dente/Face é obrigatório"] 
  },
  profissional: { 
    type: String, 
    required: [true, "Profissional é obrigatório"] 
  },
  modalidadePagamento: {
    type: String,
    enum: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Convênio", "Boleto"],
    required: [true, "Modalidade de pagamento é obrigatória"]
  },
  valor: { 
    type: Number, 
    min: 0, 
    required: [true, "Valor é obrigatório"] 
  },
  dataProcedimento: {
    type: String,
    required: [true, "Data do procedimento é obrigatória"],
    validate: {
      validator: function(v) {
        return /^\d{2}\/\d{2}\/\d{4}$/.test(v);
      },
      message: 'Formato de data inválido (DD/MM/AAAA)'
    }
  },
  dataNovoProcedimento: {
    type: String,
    required: [true, "Data do novo procedimento é obrigatória"],
    validate: {
      validator: function(v) {
        return /^\d{2}\/\d{2}\/\d{4}$/.test(v);
      },
      message: 'Formato de data inválido (DD/MM/AAAA)'
    }
  }
}, { 
  timestamps: true 
});

// Schema principal do usuário (atualizado)
const UserSchema = new mongoose.Schema({
  // Dados Pessoais
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

  // Datas (dataNascimento mantém como Date, procedimentos como String)
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
  dataProcedimento: {
    type: String,
    required: [true, "Data do procedimento é obrigatória"],
    validate: {
      validator: function(v) {
        return /^\d{2}\/\d{2}\/\d{4}$/.test(v);
      },
      message: 'Formato de data inválido (DD/MM/AAAA)'
    }
  },
  dataNovoProcedimento: {
    type: String,
    required: [true, "Data do novo procedimento é obrigatória"],
    validate: {
      validator: function(v) {
        return /^\d{2}\/\d{2}\/\d{4}$/.test(v);
      },
      message: 'Formato de data inválido (DD/MM/AAAA)'
    }
  },

  // Autenticação
  password: {
    type: String,
    select: false,
    required: [true, "Senha é obrigatória"]
  },

  // Saúde
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

  // Hábitos
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

  // Exames
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

  // Histórico Médico
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

  // Procedimento Principal
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

  // Histórico
  historicoProcedimentos: [ProcedimentoSchema],

  // Imagem
  image: { type: String },

  // Controle de Acesso
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

// Índices
UserSchema.index({ cpf: 1, email: 1 });

// Middleware para conversão de datas (opcional)
UserSchema.pre('save', function(next) {
  // Converte dataNascimento para Date se for string
  if (typeof this.dataNascimento === 'string' && this.dataNascimento.includes('/')) {
    const [day, month, year] = this.dataNascimento.split('/');
    this.dataNascimento = new Date(`${year}-${month}-${day}`);
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);