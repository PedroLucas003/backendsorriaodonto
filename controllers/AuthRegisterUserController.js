const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Funções auxiliares
function formatDateForInput(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

function convertValueToFloat(valor) {
  if (!valor) return 0;
  if (typeof valor === 'number') return valor;
  return parseFloat(valor.toString().replace(/[^\d,]/g, '').replace(',', '.'));
}

module.exports = class AuthRegisterUserController {
  static async registerUser(req, res) {
    const userData = req.body;

    // Valida apenas a senha se for fornecida
    if (userData.password && userData.password !== userData.confirmPassword) {
      return res.status(422).json({ message: "As senhas não coincidem!" });
    }

    // Remove campos vazios
    Object.keys(userData).forEach(key => {
      if (userData[key] === "" || userData[key] === null || userData[key] === undefined) {
        delete userData[key];
      }
    });

    // Hash da senha se existir
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }

    // Formata datas
    if (userData.dataNascimento) {
      userData.dataNascimento = new Date(userData.dataNascimento);
    }
    if (userData.dataProcedimento) {
      userData.dataProcedimento = new Date(userData.dataProcedimento);
    }

    try {
      const user = await User.create(userData);
      res.status(201).json({ 
        message: "Usuário cadastrado com sucesso!", 
        user: {
          _id: user._id,
          nomeCompleto: user.nomeCompleto,
          email: user.email,
          cpf: user.cpf,
          role: user.role
        }
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ 
          message: "Erro ao cadastrar usuário",
          error: "CPF ou E-mail já cadastrado"
        });
      }
      res.status(500).json({ 
        message: "Erro ao cadastrar usuário", 
        error: error.message 
      });
    }
  }

  static async updateUser(req, res) {
    const { id } = req.params;
    const userData = req.body;

    try {
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      // Formata datas
      if (userData.dataProcedimento) {
        const procDate = new Date(userData.dataProcedimento);
        if (isNaN(procDate.getTime())) {
          return res.status(400).json({ message: "Data do procedimento inválida!" });
        }
        
        const birthDate = userData.dataNascimento ? 
          new Date(userData.dataNascimento) : 
          existingUser.dataNascimento;
        
        if (procDate <= birthDate) {
          return res.status(400).json({
            message: "Data do procedimento deve ser após a data de nascimento"
          });
        }
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
        { new: true, lean: true }
      );

      // Preparar resposta
      const responseUser = {
        ...updatedUser,
        frequenciaFumo: updatedUser.habitos?.frequenciaFumo || "",
        frequenciaAlcool: updatedUser.habitos?.frequenciaAlcool || ""
      };

      delete responseUser.password;

      res.json({
        message: "Usuário atualizado com sucesso!",
        user: responseUser
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: true,
        message: "Erro ao atualizar usuário.",
        error: error.message,
      });
    }
  }

  static async deleteUser(req, res) {
    const { id } = req.params;

    try {
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }
      res.json({ message: "Usuário excluído com sucesso!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        message: "Erro ao excluir usuário.",
        error: error.message 
      });
    }
  }

  static async loginUser(req, res) {
    const { cpf, password } = req.body;
    
    if (!cpf || !password) {
      return res.status(422).json({ message: "CPF e senha são obrigatórios!" });
    }

    const cpfLimpo = cpf.replace(/\D/g, '');

    try {
      const user = await User.findOne({ 
        $or: [
          { cpf: cpfLimpo },
          { cpf: cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") }
        ]
      }).select('+password');
      
      if (!user) {
        return res.status(403).json({ message: "Acesso não autorizado: usuário não encontrado." });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Senha incorreta!" });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h"
      });

      res.status(200).json({
        token,
        user: {
          id: user._id,
          nomeCompleto: user.nomeCompleto,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error("Erro no login:", error);
      res.status(500).json({
        message: "Erro no servidor, tente novamente!",
        error: error.message
      });
    }
  }

  static async getProntuario(req, res) {
    const { cpf, password } = req.body;

    if (!cpf || !password) {
      return res.status(422).json({ message: "CPF e senha são obrigatórios!" });
    }

    try {
      const cleanedCPF = cpf.replace(/\D/g, '');
      const user = await User.findOne({ cpf: cleanedCPF }).select('+password');
      
      if (!user) {
        return res.status(404).json({ message: "Paciente não encontrado!" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Senha incorreta!" });
      }

      // Formatar valores monetários
      const formatarValor = (valor) => {
        if (valor === undefined || valor === null) return null;
        const num = typeof valor === 'string' ? 
          parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) : 
          valor;
        return isNaN(num) ? null : num;
      };

      // Ordenar procedimentos por data
      const todosProcedimentos = [
        {
          dataProcedimento: user.dataProcedimento,
          procedimento: user.procedimento,
          denteFace: user.denteFace,
          valor: formatarValor(user.valor),
          modalidadePagamento: user.modalidadePagamento,
          profissional: user.profissional,
          isPrincipal: true
        },
        ...(user.historicoProcedimentos || []).map(p => ({ 
          ...p.toObject(), 
          isPrincipal: false,
          valor: formatarValor(p.valor)
        }))
      ].sort((a, b) => new Date(b.dataProcedimento) - new Date(a.dataProcedimento));

      // Retornar os dados formatados
      const prontuario = {
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        cpf: user.cpf,
        telefone: user.telefone,
        endereco: user.endereco,
        dataNascimento: user.dataNascimento ? formatDateForInput(user.dataNascimento) : null,
        detalhesDoencas: user.detalhesDoencas,
        quaisRemedios: user.quaisRemedios,
        quaisMedicamentos: user.quaisMedicamentos,
        quaisAnestesias: user.quaisAnestesias,
        habitos: {
          frequenciaFumo: user.habitos?.frequenciaFumo || null,
          frequenciaAlcool: user.habitos?.frequenciaAlcool || null
        },
        historicoCirurgia: user.historicoCirurgia,
        exames: {
          exameSangue: user.exames?.exameSangue || null,
          coagulacao: user.exames?.coagulacao || null,
          cicatrizacao: user.exames?.cicatrizacao || null
        },
        historicoOdontologico: user.historicoOdontologico,
        sangramentoPosProcedimento: user.sangramentoPosProcedimento,
        respiracao: user.respiracao,
        peso: user.peso,
        procedimentos: todosProcedimentos,
        image: user.image
      };

      return res.status(200).json(prontuario);
    } catch (error) {
      console.error("Erro ao buscar prontuário:", error);
      res.status(500).json({ 
        message: "Erro no servidor, tente novamente!",
        error: error.message 
      });
    }
  }

  static async addProcedimento(req, res) {
    const { id } = req.params;
    const procedimentoData = req.body;

    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
      }

      // Formatar data e valor
      const dataProc = procedimentoData.dataProcedimento ? 
        new Date(procedimentoData.dataProcedimento) : null;
      
      const valorNumerico = procedimentoData.valor ? 
        convertValueToFloat(procedimentoData.valor) : 0;

      if (dataProc && isNaN(dataProc.getTime())) {
        return res.status(400).json({ message: "Data inválida!" });
      }

      // Validar contra data de nascimento
      if (dataProc && user.dataNascimento && dataProc <= user.dataNascimento) {
        return res.status(400).json({
          message: "Data do procedimento deve ser após a data de nascimento"
        });
      }

      // Criar novo procedimento
      const novoProcedimento = {
        dataProcedimento: dataProc,
        procedimento: procedimentoData.procedimento || '',
        denteFace: procedimentoData.denteFace || '',
        valor: valorNumerico,
        modalidadePagamento: procedimentoData.modalidadePagamento || '',
        profissional: procedimentoData.profissional || '',
        createdAt: new Date()
      };

      // Atualizar usuário
      const usuarioAtualizado = await User.findByIdAndUpdate(
        id,
        { $push: { historicoProcedimentos: novoProcedimento } },
        { new: true }
      ).select('-password');

      res.status(201).json({
        message: "Procedimento adicionado com sucesso!",
        procedimento: novoProcedimento
      });

    } catch (error) {
      console.error("Erro ao adicionar procedimento:", error);
      res.status(500).json({ 
        message: "Erro ao adicionar procedimento",
        error: error.message
      });
    }
  }
};