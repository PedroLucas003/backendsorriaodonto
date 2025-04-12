const mongoose = require("mongoose");

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
      validator: function(v) {
        return /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(v);
      },
      message: props => `${props.value} não é um CPF válido!`
    }
  },
  telefone: { 
    type: String, 
    required: [true, "O telefone é obrigatório"],
    validate: {
      validator: function(v) {
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
      validator: function(v) {
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
      enum: ["Nunca", "Ocasionalmente", "Frequentemente", "Diariamente", ""],
      default: ""
    },
    frequenciaAlcool: { 
      type: String,
      enum: ["Nunca", "Ocasionalmente", "Frequentemente", "Diariamente", ""],
      default: ""
    }
  },

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

  procedimentos: {
    sangramentoPosProcedimento: { 
      type: String,
      trim: true
    },
    quaisAnestesias: { 
      type: String,
      trim: true
    },
    respiracao: { 
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
    required: [true, "O histórico odontológico é obrigatório"],
    trim: true
  },

  // Novos campos
  dataPrimeiraConsulta: { 
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v < new Date();
      },
      message: "A data da primeira consulta não pode ser no futuro"
    }
  },
  qualProcedimento: { 
    type: String,
    trim: true
  },
  dente: { 
    type: String,
    trim: true
  },

  // Informações do procedimento
  peso: { 
    type: String,
    validate: {
      validator: function(v) {
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
    type: Date, 
    required: [true, "A data do procedimento é obrigatória"],
    validate: {
      validator: function(v) {
        return v >= new Date(this.dataPrimeiraConsulta || 0);
      },
      message: "Data do procedimento não pode ser antes da primeira consulta"
    }
  },
  modalidadePagamento: { 
    type: String, 
    required: [true, "A modalidade de pagamento é obrigatória"],
    enum: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Convênio"]
  },
  valor: { 
    type: Number, 
    required: [true, "O valor é obrigatório"],
    min: [0, "O valor não pode ser negativo"]
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
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
UserSchema.index({ cpf: 1, email: 1 });

// Middleware para pré-processamento
UserSchema.pre('save', function(next) {
  if (this.isModified('nomeCompleto')) {
    this.nomeCompleto = this.nomeCompleto.trim();
  }
  if (this.isModified('cpf') && !this.cpf.includes('.')) {
    this.cpf = this.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  next();
});

// Virtual
UserSchema.virtual('nomeFormatado').get(function() {
  return this.nomeCompleto.split(' ')
    .map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
    .join(' ');
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
