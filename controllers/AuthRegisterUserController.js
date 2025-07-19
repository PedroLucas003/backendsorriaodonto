const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require('express-validator');

// Função para formatar erros do Mongoose
const formatMongooseErrors = (error) => {
  if (!error.errors) return null;

  const errors = {};
  Object.keys(error.errors).forEach(key => {
    errors[key] = error.errors[key].message;
  });
  return errors;
};



// Função para validar dados antes de salvar
const validateUserData = (userData) => {
  const errors = {};

  // Validações adicionais podem ser adicionadas aqui
  if (userData.password && userData.password.length < 6) {
    errors.password = "A senha deve ter pelo menos 6 caracteres";
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

module.exports = class AuthRegisterUserController {
  static async registerUser(req, res) {
    try {
      // Validação dos dados
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Erro de validação",
          errors: errors.array().reduce((acc, err) => {
            acc[err.param] = err.msg;
            return acc;
          }, {})
        });
      }

      const userData = req.body;

      // Valida senha
      if (userData.password !== userData.confirmPassword) {
        return res.status(422).json({
          message: "Erro de validação",
          errors: { confirmPassword: "As senhas não coincidem!" }
        });
      }

      // Validações adicionais
      const validationErrors = validateUserData(userData);
      if (validationErrors) {
        return res.status(400).json({
          message: "Erro de validação",
          errors: validationErrors
        });
      }

      // Hash da senha
      userData.password = await bcrypt.hash(userData.password, 12);

      // Cria usuário
      const user = await User.create(userData);

      // Remove senha da resposta
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        message: "Usuário cadastrado com sucesso!",
        user: userResponse
      });
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);

      // Tratamento de erros do Mongoose
      if (error.name === 'ValidationError') {
        const mongooseErrors = formatMongooseErrors(error);
        return res.status(400).json({
          message: "Erro de validação",
          errors: mongooseErrors || error.message
        });
      }

      if (error.code === 11000) {
        return res.status(400).json({
          message: "Erro ao cadastrar usuário",
          error: "CPF ou E-mail já cadastrado"
        });
      }

      res.status(500).json({
        message: "Erro interno no servidor",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }


  static async refreshToken(req, res) {
    try {
      // Pega o token antigo (que pode estar expirado)
      const oldToken = req.headers.authorization?.split(' ')[1];

      if (!oldToken) {
        return res.status(401).json({ message: "Token não fornecido" });
      }

      // Verifica o token mesmo expirado
      const decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });

      // Gera novo token
      const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
        expiresIn: "30d" // Novo tempo de expiração
      });

      res.json({ token: newToken });
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      res.status(401).json({ message: "Não foi possível renovar o token" });
    }
  }

  static async updateProcedimento(req, res) {
    try {
      const { id, procedimentoId } = req.params;
      const procedimentoData = req.body;

      // Validação mais robusta
      if (!procedimentoData.procedimento || !procedimentoData.denteFace ||
        !procedimentoData.valor || !procedimentoData.dataNovoProcedimento) {
        return res.status(400).json({
          message: "Todos os campos são obrigatórios",
          error: "MISSING_FIELDS"
        });
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: id, "historicoProcedimentos._id": procedimentoId },
        {
          $set: {
            "historicoProcedimentos.$": {
              ...procedimentoData,
              _id: procedimentoId,
              dataNovoProcedimento: new Date(procedimentoData.dataNovoProcedimento)
            }
          }
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          message: "Procedimento não encontrado",
          error: "NOT_FOUND"
        });
      }

      res.status(200).json({
        message: "Procedimento atualizado com sucesso!",
        procedimento: updatedUser.historicoProcedimentos.id(procedimentoId)
      });

    } catch (error) {
      console.error("Erro ao atualizar procedimento:", error);
      res.status(500).json({
        message: "Erro interno no servidor",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async deleteProcedimento(req, res) {
    try {
      const { id, procedimentoId } = req.params;

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $pull: { historicoProcedimentos: { _id: procedimentoId } } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          message: "Usuário não encontrado",
          error: "NOT_FOUND"
        });
      }

      res.status(200).json({
        message: "Procedimento excluído com sucesso!",
        userId: id
      });

    } catch (error) {
      console.error("Erro ao excluir procedimento:", error);
      res.status(500).json({
        message: error.message || "Erro interno no servidor"
      });
    }
  }

static async getAllUsers(req, res) {
  try {
    console.log('[API] Buscando usuários...');
    console.log('[API] Usuário autenticado ID:', req.userId);

    const users = await User.find({})
      .select('-password -__v')
      .sort({ createdAt: -1 });

    console.log(`[API] ${users.length} usuários encontrados`);
    res.json(users);

  } catch (error) {
    console.error('[API] Erro crítico:', error);
    res.status(500).json({ 
      success: false,
      message: "Erro no servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
}

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;

      // Validação dos dados
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Erro de validação",
          errors: errors.array().reduce((acc, err) => {
            acc[err.param] = err.msg;
            return acc;
          }, {})
        });
      }

      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          message: "Usuário não encontrado.",
          error: "NOT_FOUND"
        });
      }

      // Atualizar imagem se fornecida
      if (req.file) {
        userData.image = req.file.filename;
      }

      // Atualizar senha se fornecida
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 12);
      }

      // Atualizar o usuário
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: userData },
        {
          new: true,
          lean: true,
          runValidators: true // Garante que as validações sejam executadas
        }
      ).select('-password');

      res.json({
        message: "Usuário atualizado com sucesso!",
        user: updatedUser
      });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);

      if (error.name === 'ValidationError') {
        const mongooseErrors = formatMongooseErrors(error);
        return res.status(400).json({
          message: "Erro de validação",
          errors: mongooseErrors || error.message
        });
      }

      res.status(500).json({
        message: "Erro interno no servidor",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser) {
        return res.status(404).json({
          message: "Usuário não encontrado.",
          error: "NOT_FOUND"
        });
      }

      res.json({
        message: "Usuário excluído com sucesso!",
        userId: id
      });
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      res.status(500).json({
        message: "Erro interno no servidor",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

static async loginUser(req, res) {
    try {
      const { cpf, password } = req.body;

      // Validação mais rápida (sem objeto complexo)
      if (!cpf || !password) {
        return res.status(422).json({
          message: "CPF e senha são obrigatórios",
          error: "MISSING_CREDENTIALS"
        });
      }

      const cpfLimpo = cpf.replace(/\D/g, '');

      // Busca otimizada - removida a verificação de CPF formatado
      const user = await User.findOne({ cpf: cpfLimpo }).select('+password').lean();

      if (!user) {
        return res.status(401).json({
          message: "Credenciais inválidas",
          error: "INVALID_CREDENTIALS"
        });
      }

      // Comparação de senha mais eficiente
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Credenciais inválidas",
          error: "INVALID_CREDENTIALS"
        });
      }

      // Token com menos dados no payload
       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "24h" // Alterado de "30d" para "24h"
        });

      // Resposta mais enxuta (mantendo a estrutura original)
      res.status(200).json({
        token,
        user: {
          id: user._id,
          nomeCompleto: user.nomeCompleto,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Erro no login:", error);
      res.status(500).json({
        message: "Erro interno no servidor",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
}

  static async getProntuario(req, res) {
    try {
      const { cpf, password } = req.body;

      // Validação dos campos obrigatórios
      if (!cpf || !password) {
        return res.status(422).json({
          message: "Erro de validação",
          errors: {
            cpf: !cpf ? "CPF é obrigatório" : undefined,
            password: !password ? "Senha é obrigatória" : undefined
          }
        });
      }

      // // Limpa o CPF (remove caracteres não numéricos)
      // const cleanedCPF = cpf.replace(/\D/g, '');

      // Busca o usuário no banco de dados (incluindo a senha para validação)
      const user = await User.findOne({ cpf: cleanedCPF }).select('+password');

      if (!user) {
        return res.status(404).json({
          message: "Paciente não encontrado!",
          error: "NOT_FOUND"
        });
      }

      // Valida a senha
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Credenciais inválidas",
          error: "INVALID_CREDENTIALS"
        });
      }

      // Função para formatar datas de forma segura
      const safeFormatDate = (date) => {
        try {
          if (!date) return null;
          // Converte para objeto Date se for string
          const d = date instanceof Date ? date : new Date(date);
          return isNaN(d.getTime()) ? null : d;
        } catch (e) {
          console.error("Erro ao formatar data:", e);
          return null;
        }
      };

      // Função para formatar data no formato DD/MM/AAAA para exibição
      const formatDateToDisplay = (date) => {
        const d = safeFormatDate(date);
        if (!d) return null;

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();

        return `${day}/${month}/${year}`;
      };

      // Prepara os procedimentos (principal + histórico)
      const procedimentoPrincipal = {
        procedimento: user.procedimento || "",
        denteFace: user.denteFace || "",
        valor: user.valor || 0,
        modalidadePagamento: user.modalidadePagamento || "",
        profissional: user.profissional || "",
        dataProcedimento: formatDateToDisplay(user.dataProcedimento),
        dataProcedimentoISO: user.dataProcedimento ? new Date(user.dataProcedimento).toISOString() : null,
        dataNovoProcedimento: formatDateToDisplay(user.dataNovoProcedimento),
        dataNovoProcedimentoISO: user.dataNovoProcedimento ? new Date(user.dataNovoProcedimento).toISOString() : null,
        isPrincipal: true,
        createdAt: formatDateToDisplay(user.createdAt),
        createdAtISO: user.createdAt ? new Date(user.createdAt).toISOString() : null
      };

      const historicoProcedimentos = (user.historicoProcedimentos || []).map(p => {
        const procedimentoDate = p.dataProcedimento || p.createdAt;
        const novoProcedimentoDate = p.dataNovoProcedimento || p.createdAt;

        return {
          ...p.toObject(),
          dataProcedimento: formatDateToDisplay(procedimentoDate),
          dataProcedimentoISO: procedimentoDate ? new Date(procedimentoDate).toISOString() : null,
          dataNovoProcedimento: formatDateToDisplay(novoProcedimentoDate),
          dataNovoProcedimentoISO: novoProcedimentoDate ? new Date(novoProcedimentoDate).toISOString() : null,
          isPrincipal: false,
          createdAt: formatDateToDisplay(p.createdAt),
          createdAtISO: p.createdAt ? new Date(p.createdAt).toISOString() : null
        };
      });

      // Ordena todos os procedimentos por data (do mais recente para o mais antigo)
      const todosProcedimentos = [procedimentoPrincipal, ...historicoProcedimentos]
        .sort((a, b) => {
          // Usa dataNovoProcedimento como prioridade, se existir
          const dateA = safeFormatDate(a.dataNovoProcedimentoISO || a.dataProcedimentoISO || a.createdAtISO);
          const dateB = safeFormatDate(b.dataNovoProcedimentoISO || b.dataProcedimentoISO || b.createdAtISO);
          return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
        });

      // Prepara o objeto de retorno com todos os dados do prontuário
      const prontuario = {
        dadosPessoais: {
          nomeCompleto: user.nomeCompleto,
          cpf: user.cpf,
          telefone: user.telefone,
          endereco: user.endereco,
          dataNascimento: formatDateToDisplay(user.dataNascimento),
          dataNascimentoISO: user.dataNascimento ? new Date(user.dataNascimento).toISOString() : null,
          image: user.image
        },
        saude: {
          detalhesDoencas: user.detalhesDoencas,
          quaisRemedios: user.quaisRemedios,
          quaisMedicamentos: user.quaisMedicamentos,
          quaisAnestesias: user.quaisAnestesias,
          habitos: {
            frequenciaFumo: user.habitos?.frequenciaFumo || "Nunca",
            frequenciaAlcool: user.habitos?.frequenciaAlcool || "Nunca"
          },
          historicoCirurgia: user.historicoCirurgia,
          respiracao: user.respiracao,
          peso: user.peso
        },
        exames: {
          exameSangue: user.exames?.exameSangue,
          coagulacao: user.exames?.coagulacao,
          cicatrizacao: user.exames?.cicatrizacao,
          sangramentoPosProcedimento: user.sangramentoPosProcedimento
        },
        odontologico: {
          historicoOdontologico: user.historicoOdontologico
        },
        procedimentos: todosProcedimentos
      };

      return res.status(200).json({
        success: true,
        message: "Prontuário recuperado com sucesso",
        data: prontuario
      });

    } catch (error) {
      console.error("Erro ao buscar prontuário:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno no servidor",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async addProcedimento(req, res) {
    try {
      const { id } = req.params;
      const procedimentoData = req.body;

      // Validação básica
      if (!procedimentoData.dataNovoProcedimento) {
        return res.status(400).json({
          message: "Data do procedimento é obrigatória",
          error: "INVALID_DATE"
        });
      }

      // Aceita tanto ISO string quanto objeto Date
      const dataNovoProcedimento = new Date(procedimentoData.dataNovoProcedimento);
      if (isNaN(dataNovoProcedimento.getTime())) {
        return res.status(400).json({
          message: "Data inválida",
          error: "INVALID_DATE"
        });
      }

      const novoProcedimento = {
        procedimento: procedimentoData.procedimento,
        denteFace: procedimentoData.denteFace,
        valor: procedimentoData.valor,
        modalidadePagamento: procedimentoData.modalidadePagamento,
        profissional: procedimentoData.profissional,
        dataNovoProcedimento: dataNovoProcedimento
      };

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $push: { historicoProcedimentos: novoProcedimento } },
        { new: true }
      );

      res.status(201).json({
        message: "Procedimento adicionado com sucesso!",
        procedimento: novoProcedimento
      });

    } catch (error) {
      console.error("Erro ao adicionar procedimento:", error);
      res.status(500).json({
        message: error.message || "Erro interno no servidor"
      });
    }
  }
};
