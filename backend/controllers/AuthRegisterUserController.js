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
      profissional,
      dataProcedimento,
      modalidadePagamento,
      valor
    } = req.body;

    let image = "";

    if (req.file) {
      image = req.file.filename;
    }

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

    const userExist = await User.findOne({ cpf: cpf });

    if (userExist) {
      return res.status(422).json({ message: "Já existe um usuário com esse CPF!" });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

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
      profissional,
      dataProcedimento,
      modalidadePagamento,
      valor
    });

    try {
      await user.save();
      res.status(201).json({ message: "Usuário cadastrado com sucesso!", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ocorreu um erro ao cadastrar o usuário, tente mais tarde!" });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await User.find().select("-password");
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar usuários." });
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

      if (req.file) {
        userData.image = req.file.filename;
      } else {
        userData.image = existingUser.image;
      }

      if (!userData.password) {
        userData.password = existingUser.password;
      } else {
        const salt = await bcrypt.genSalt(12);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      const updatedUser = await User.findByIdAndUpdate(id, userData, { new: true });
      res.json({ message: "Usuário atualizado com sucesso!", user: updatedUser });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao atualizar usuário." });
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
      res.status(500).json({ message: "Erro ao excluir usuário." });
    }
  }

  static async loginUser(req, res) {
    const { cpf, password } = req.body;
  
    // 1. Validação básica
    if (!cpf || !password) {
      return res.status(422).json({ message: "CPF e senha são obrigatórios!" });
    }
  
    try {
      // 2. Limpa formatação do CPF
      const cpfLimpo = cpf.replace(/\D/g, '');
  
      // 3. Busca usuário (APENAS se estiver autorizado)
      const user = await User.findOne({ 
        cpf: cpfLimpo,
        autorizado: true // ← Filtro chave!
      }).select('+password');
  
      // 4. Verificações
      if (!user) {
        return res.status(403).json({ 
          message: "Acesso não autorizado ou usuário não encontrado" 
        });
      }
  
      // 5. Valida senha
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Senha incorreta!" });
      }
  
      // 6. Gera token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h"
      });
  
      // 7. Retorna dados
      res.status(200).json({
        token,
        user: {
          id: user._id,
          nomeCompleto: user.nomeCompleto,
          email: user.email
        }
      });
  
    } catch (error) {
      console.error("Erro no login:", error);
      res.status(500).json({ message: "Erro no servidor, tente novamente!" });
    }
  }

  static async autorizarUsuario(req, res) {
    const { cpf } = req.body;
  
    try {
      const cpfLimpo = cpf.replace(/\D/g, '');
      const user = await User.findOneAndUpdate(
        { cpf: cpfLimpo },
        { $set: { autorizado: true } },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
      }
  
      res.status(200).json({ 
        message: "Acesso autorizado com sucesso!",
        user 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao autorizar usuário" });
    }
  }


  static async getProntuario(req, res) {
    const { cpf, password } = req.body;
  
    if (!cpf || !password) {
      return res.status(422).json({ message: "CPF e senha são obrigatórios!" });
    }
  
    try {
      // Limpa o CPF (remove pontos e traços)
      const cleanedCPF = cpf.replace(/\D/g, "");
  
      // Busca o usuário incluindo o campo password (que está com select: false no modelo)
      const user = await User.findOne({ cpf: cleanedCPF }).select('+password');
      
      if (!user) {
        return res.status(404).json({ message: "Paciente não encontrado!" });
      }
  
      // Verifica a senha
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Senha incorreta!" });
      }
  
      // Formata os dados do prontuário (sem expor a senha)
      const prontuario = {
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        cpf: user.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4"), // Formata CPF
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
        sangramentoPosProcedimento: user.procedimentos?.sangramentoPosProcedimento || "",
        respiracao: user.procedimentos?.respiracao || "",
        peso: user.peso,
        profissional: user.profissional,
        dataProcedimento: user.dataProcedimento,
        modalidadePagamento: user.modalidadePagamento,
        valor: user.valor,
        // Adicione outros campos conforme necessário
      };
  
      return res.status(200).json(prontuario);
    } catch (error) {
      console.error("Erro ao buscar prontuário:", error);
      res.status(500).json({ message: "Erro no servidor, tente novamente!" });
    }
  }
  
};