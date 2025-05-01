const mongoose = require("mongoose");

// Schema para os procedimentos
const ProcedimentoSchema = new mongoose.Schema({
  dataProcedimento: {
    type: String,
    required: true
  },
  procedimento: {
    type: String,
    required: true
  },
  denteFace: {
    type: String,
    required: [true, "Dente/Face é obrigatório"],
    trim: true
  },
  profissional: {
    type: String,
    required: [true, "O profissional é obrigatório"],
    trim: true
  },
  modalidadePagamento: {
    type: String,
    required: [true, "A modalidade de pagamento é obrigatória"],
    enum: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Convênio", "Boleto"]
  },
  valor: {
    type: Number,
    required: [true, "O valor é obrigatório"],
    min: [0, "O valor não pode ser negativo"]
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, {
  _id: true, // Isso é essencial
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


const UserSchema = new mongoose.Schema({
  // Dados pessoais
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
    match: [/^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/, "Por favor, insira um email válido"]
  },
  cpf: {
    type: String,
    required: [true, "O CPF é obrigatório"],
    unique: true,
    validate: {
      validator: function (v) {
        return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v) || /^\d{11}$/.test(v);
      },
      message: "Use o formato 000.000.000-00 ou 11 dígitos"
    }
  },
  telefone: {
    type: String,
    required: [true, "O telefone é obrigatório"],
    validate: {
      validator: function (v) {
        return /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/.test(v);
      },
      message: props => `${props.value} não é um telefone válido!`
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
      validator: function (v) {
        return v < new Date();
      },
      message: "A data de nascimento não pode ser no futuro"
    }
  },
  image: {
    type: String,
    default: "default-profile.jpg"
  },
  password: {
    type: String,
    required: [true, "A senha é obrigatória"],
    minlength: [6, "A senha deve ter pelo menos 6 caracteres"],
    select: false
  },

  // Informações de saúde
  detalhesDoencas: {
    type: String,
    required: [true, "Os detalhes sobre doenças são obrigatórios"],
    trim: true
  },
  quaisRemedios: {
    type: String,
    required: [true, "Os medicamentos são obrigatórios"],
    trim: true
  },
  quaisMedicamentos: {
    type: String,
    required: [true, "Os medicamentos são obrigatórios"],
    trim: true
  },
  quaisAnestesias: {
    type: String,
    required: [true, "As anestesias são obrigatórias"],
    trim: true
  },
  alergiaMedicamento: {
    type: String,
    trim: true
  },

  // Campos agrupados
  habitos: {
    frequenciaFumo: {
      type: String,
      enum: ["Nunca", "Raramente", "Ocasionalmente", "Frequentemente", "Diariamente", ""],
      default: ""
    },
    frequenciaAlcool: {
      type: String,
      enum: ["Nunca", "Raramente", "Ocasionalmente", "Frequentemente", "Diariamente", ""],
      default: ""
    }
  },

  // Exames
  exames: {
    exameSangue: {
      type: String,
      trim: true
    },
    coagulacao: {
      type: String,
      trim: true
    },
    cicatrizacao: {
      type: String,
      trim: true
    }
  },

  // Históricos
  historicoCirurgia: {
    type: String,
    required: [true, "O histórico cirúrgico é obrigatório"],
    trim: true
  },
  historicoOdontologico: {
    type: String,
    trim: true
  },

  // Informações do procedimento principal
  procedimento: {
    type: String,
    required: [true, "O procedimento é obrigatório"],
    trim: true
  },
  denteFace: {
    type: String,
    required: [true, "Dente/Face é obrigatório"],
    trim: true
  },
  peso: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || /^\d+(\.\d{1,2})?$/.test(v);
      },
      message: "Peso deve ser um número válido (ex: 70.5)"
    }
  },
  profissional: {
    type: String,
    required: [true, "O profissional é obrigatório"],
    trim: true
  },
  dataProcedimento: {
    type: String, // Mantém como String
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v); // Valida formato YYYY-MM-DD
      },
      message: "Formato de data inválido. Use YYYY-MM-DD"
    }
  },
  modalidadePagamento: {
    type: String,
    required: [true, "A modalidade de pagamento é obrigatória"],
    enum: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Convênio", "Boleto"]
  },
  valor: {
    type: Number,
    required: [true, "O valor é obrigatório"],
    min: [0, "O valor não pode ser negativo"]
  },
  sangramentoPosProcedimento: {
    type: String,
    trim: true
  },
  respiracao: {
    type: String,
    trim: true
  },

  // Histórico de procedimentos
  historicoProcedimentos: {
    type: [ProcedimentoSchema],
    default: []
  },

  // Controle de acesso
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "medico"]
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret.password;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Índices
UserSchema.index({ cpf: 1, email: 1 });
UserSchema.index({ "historicoProcedimentos.dataProcedimento": 1 });
UserSchema.index({ "historicoProcedimentos.profissional": 1 });

// Middleware para pré-processamento e validação
UserSchema.pre('save', function (next) {
  // Formatação do nome
  if (this.isModified('nomeCompleto')) {
    this.nomeCompleto = this.nomeCompleto.trim();
  }

  // Formatação do CPF
  if (this.isModified('cpf') && !this.cpf.includes('.')) {
    this.cpf = this.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  // Validação de datas do procedimento principal
  if (this.isModified('dataProcedimento') && this.dataNascimento && this.dataProcedimento < this.dataNascimento) {
    throw new Error("Data do procedimento principal não pode ser antes da data de nascimento");
  }

  // Validação dos procedimentos no histórico
  if (this.isModified('historicoProcedimentos') && this.dataNascimento) {
    this.historicoProcedimentos.forEach(proc => {
      if (new Date(proc.dataProcedimento) < new Date(this.dataNascimento)) {
        throw new Error(`Data do procedimento no histórico (${proc.dataProcedimento}) não pode ser antes da data de nascimento`);
      }
    });
  }

  next();
});

// Virtual para nome formatado
UserSchema.virtual('nomeFormatado').get(function () {
  return this.nomeCompleto.split(' ')
    .map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
    .join(' ');
});

// Virtual para idade
UserSchema.virtual('idade').get(function () {
  if (!this.dataNascimento) return null;
  const diff = Date.now() - this.dataNascimento.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});

// Virtual para o último procedimento
UserSchema.virtual('ultimoProcedimento').get(function () {
  if (this.historicoProcedimentos && this.historicoProcedimentos.length > 0) {
    return this.historicoProcedimentos.reduce((latest, current) =>
      new Date(current.dataProcedimento) > new Date(latest.dataProcedimento) ? current : latest
    );
  }
  return null;
});

// Método para adicionar procedimento ao histórico
UserSchema.methods.adicionarProcedimento = function (procedimentoData) {
  this.historicoProcedimentos.push(procedimentoData);
  return this.save();
};

const User = mongoose.model("User", UserSchema);

module.exports = User;