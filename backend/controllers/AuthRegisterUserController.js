const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = class AuthRegisterUserController {
  static async init(req, res) {
    res.send({ message: "Bem-vindo à nossa API!" });
  }

  static async registerUser(req, res) {
    const {
      nomeCompleto,
      email,
      cpf,
      telefone,
      endereco,
      dataNascimento,
      password,
      confirmPassword,
      detalhesDoencas,
      quaisRemedios,
      quaisAnestesias,
      frequenciaFumo,
      frequenciaAlcool,
      historicoCirurgia,
      exameSangue,
      coagulacao,
      cicatrizacao,
      historicoOdontologico,
      sangramentoPosProcedimento,
      respiracao,
      peso,
      procedimento,
      denteFace,
      profissional,
      dataProcedimento,
      modalidadePagamento,
      valor
    } = req.body;

    let image = "";

    if (req.file) {
      image = req.file.filename;
    }

    // Validações atualizadas
    const requiredFields = {
      nomeCompleto: "O nome completo é obrigatório!",
      email: "O email é obrigatório!",
      cpf: "O CPF é obrigatório!",
      telefone: "O telefone é obrigatório!",
      endereco: "O endereço é obrigatório!",
      dataNascimento: "A data de nascimento é obrigatória!",
      password: "A senha é obrigatória!",
      detalhesDoencas: "Os detalhes sobre doenças são obrigatórios!",
      quaisRemedios: "Informação sobre medicamentos é obrigatória!",
      historicoCirurgia: "O histórico cirúrgico é obrigatório!",
      procedimento: "O procedimento é obrigatório!",
      denteFace: "Dente/Face é obrigatório!",
      profissional: "O profissional é obrigatório!",
      dataProcedimento: "A data do procedimento é obrigatória!",
      modalidadePagamento: "A modalidade de pagamento é obrigatória!",
      valor: "O valor é obrigatório!"
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!req.body[field]) {
        return res.status(422).json({ message });
      }
    }

    if (password !== confirmPassword) {
      return res.status(422).json({ message: "As senhas não são iguais!" });
    }

    // Verifica se usuário já existe
    const userExist = await User.findOne({ cpf: cpf });
    if (userExist) {
      return res.status(422).json({ message: "Já existe um usuário com esse CPF!" });
    }

    // Criptografia da senha
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Criação do usuário com os novos campos
    const user = new User({
      nomeCompleto,
      email,
      cpf,
      telefone,
      endereco,
      dataNascimento,
      image,
      password: passwordHash,
      detalhesDoencas,
      quaisRemedios,
      quaisAnestesias,
      habitos: {
        frequenciaFumo,
        frequenciaAlcool
      },
      historicoCirurgia,
      exames: {
        exameSangue,
        coagulacao,
        cicatrizacao
      },
      historicoOdontologico,
      sangramentoPosProcedimento,
      respiracao,
      peso,
      procedimento,
      denteFace,
      profissional,
      dataProcedimento,
      modalidadePagamento,
      valor
    });

    try {
      await user.save();
      res.status(201).json({ 
        message: "Usuário cadastrado com sucesso!",
        user: {
          _id: user._id,
          nomeCompleto: user.nomeCompleto,
          email: user.email,
          procedimento: user.procedimento,
          denteFace: user.denteFace
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        message: "Ocorreu um erro ao cadastrar o usuário",
        error: error.message 
      });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await User.find().select("-password");
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        message: "Erro ao buscar usuários.",
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

      // Atualização de imagem
      if (req.file) {
        userData.image = req.file.filename;
      } else {
        userData.image = existingUser.image;
      }

      // Atualização de senha
      if (!userData.password) {
        userData.password = existingUser.password;
      } else {
        const salt = await bcrypt.genSalt(12);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      // Atualização dos exames
      if (userData.exameSangue || userData.coagulacao || userData.cicatrizacao) {
        userData.exames = {
          exameSangue: userData.exameSangue || existingUser.exames?.exameSangue,
          coagulacao: userData.coagulacao || existingUser.exames?.coagulacao,
          cicatrizacao: userData.cicatrizacao || existingUser.exames?.cicatrizacao
        };
      }

      // Atualização dos hábitos
      if (userData.frequenciaFumo || userData.frequenciaAlcool) {
        userData.habitos = {
          frequenciaFumo: userData.frequenciaFumo || existingUser.habitos?.frequenciaFumo,
          frequenciaAlcool: userData.frequenciaAlcool || existingUser.habitos?.frequenciaAlcool
        };
      }

      const updatedUser = await User.findByIdAndUpdate(
        id, 
        { $set: userData },
        { new: true, runValidators: true }
      );

      res.json({ 
        message: "Usuário atualizado com sucesso!",
        user: updatedUser 
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        message: "Erro ao atualizar usuário.",
        error: error.message 
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
  
    try {
      const cpfLimpo = cpf.replace(/\D/g, '');
  
      const user = await User.findOne({ cpf: cpfLimpo }).select('+password');
  
      if (!user) {
        return res.status(403).json({ message: "Acesso não autorizado ou usuário não encontrado" });
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
      const cleanedCPF = cpf.replace(/\D/g, "");
      const user = await User.findOne({ cpf: cleanedCPF }).select('+password');
      
      if (!user) {
        return res.status(404).json({ message: "Paciente não encontrado!" });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Senha incorreta!" });
      }
  
      // Retorna os dados formatados com os novos campos
      const prontuario = {
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        cpf: user.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4"),
        telefone: user.telefone,
        endereco: user.endereco,
        dataNascimento: user.dataNascimento,
        detalhesDoencas: user.detalhesDoencas,
        quaisRemedios: user.quaisRemedios,
        quaisAnestesias: user.quaisAnestesias,
        frequenciaFumo: user.habitos?.frequenciaFumo || "",
        frequenciaAlcool: user.habitos?.frequenciaAlcool || "",
        historicoCirurgia: user.historicoCirurgia,
        exameSangue: user.exames?.exameSangue || "",
        coagulacao: user.exames?.coagulacao || "",
        cicatrizacao: user.exames?.cicatrizacao || "",
        historicoOdontologico: user.historicoOdontologico,
        sangramentoPosProcedimento: user.sangramentoPosProcedimento,
        respiracao: user.respiracao,
        peso: user.peso,
        procedimento: user.procedimento,
        denteFace: user.denteFace,
        profissional: user.profissional,
        dataProcedimento: user.dataProcedimento,
        modalidadePagamento: user.modalidadePagamento,
        valor: user.valor,
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
};