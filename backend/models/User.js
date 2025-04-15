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
        return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v) || /^\d{11}$/.test(v);
      },
      message: "Use o formato 000.000.000-00 ou 11 dígitos"
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

  // Informações do procedimento (MODIFICADO - removido enum)
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
        return v >= new Date(this.dataNascimento);
      },
      message: "Data do procedimento não pode ser antes da data de nascimento"
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
  // Formatação do nome
  if (this.isModified('nomeCompleto')) {
    this.nomeCompleto = this.nomeCompleto.trim();
  }
  
  // Formatação do CPF
  if (this.isModified('cpf') && !this.cpf.includes('.')) {
    this.cpf = this.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  
  // Garantir que dataProcedimento não seja anterior à dataNascimento
  if (this.isModified('dataProcedimento') && this.dataProcedimento < this.dataNascimento) {
    throw new Error("Data do procedimento não pode ser antes da data de nascimento");
  }
  
  next();
});

// Virtual para nome formatado
UserSchema.virtual('nomeFormatado').get(function() {
  return this.nomeCompleto.split(' ')
    .map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
    .join(' ');
});

// Virtual para idade
UserSchema.virtual('idade').get(function() {
  const diff = Date.now() - this.dataNascimento.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});

const User = mongoose.model("User", UserSchema);

module.exports = User;