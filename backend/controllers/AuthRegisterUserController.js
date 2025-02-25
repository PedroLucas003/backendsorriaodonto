const User = require("../models/User");
const bcrypt = require("bcrypt");

module.exports = class AuthRegisterUserController {
  static async init(req, res) {
    res.send({ message: "Bem-vindo à nossa API!" });
  }

  static async registerUser(req, res) {
    const { nome, email, idade, password, confirmPassword, fone, rg, sexo, cpf, endereco, possuiAlgumaDoencaAtualmente, tratamentoMedico, medicacaoAtualmente, alergiaRemedio, historicoDoenca, condicoesHemograma, historicoProcedimentoOdontologico, procedimento, denteface, valor, modalidade, profissional } = req.body;

    let image = "";

    if (req.file) {
      image = req.file.filename;
    }

    if (!nome) {
      return res.status(422).json({ message: "O nome é obrigatório!" });
    }

    if (!email) {
      return res.status(422).json({ message: "O email é obrigatório!" });
    }

    if (!idade) {
      return res.status(422).json({ message: "A idade é obrigatória!" });
    }

    if (!password) {
      return res.status(422).json({ message: "A senha é obrigatória!" });
    }

    if (password != confirmPassword) {
      return res.status(422).json({ message: "As senhas não são iguais!" });
    }

    if (!fone) {
      return res.status(422).json({ message: "O telefone é obrigatório!" });
    }

    if (!rg) {
      return res.status(422).json({ message: "O RG é obrigatório!" });
    }

    if (!sexo) {
      return res.status(422).json({ message: "O sexo é obrigatório!" });
    }

    if (!cpf) {
      return res.status(422).json({ message: "O CPF é obrigatório!" });
    }

    if (!endereco) {
      return res.status(422).json({ message: "O endereço é obrigatório!" });
    }

    if (!possuiAlgumaDoencaAtualmente) {
      return res.status(422).json({ message: "Este campo é obrigatório!" });
    }

    if (!tratamentoMedico) {
      return res.status(422).json({ message: "O Tratamento médico é obrigatório!" });
    }

    if (!medicacaoAtualmente) {
      return res.status(422).json({ message: "A medicação atualmente é obrigatória!" });
    }

    if (!alergiaRemedio) {
      return res.status(422).json({ message: "A alergia a remédio é obrigatória!" });
    }

    if (!historicoDoenca) {
      return res.status(422).json({ message: "O histórico de doenças é obrigatório!" });
    }

    if (!condicoesHemograma) {
      return res.status(422).json({ message: "As condições do hemograma são obrigatórias!" });
    }

    if (!historicoProcedimentoOdontologico) {
      return res.status(422).json({ message: "O histórico de procedimentos odontológicos é obrigatório!" });
    }

    if (!procedimento) {
      return res.status(422).json({ message: "O procedimento é obrigatório!" });
    }

    if (!denteface) {
      return res.status(422).json({ message: "O denteface é obrigatório!" });
    }

    if (!valor) {
      return res.status(422).json({ message: "O valor é obrigatório!" });
    }

    if (!modalidade) {
      return res.status(422).json({ message: "A modalidade é obrigatória!" });
    }

    if (!profissional) {
      return res.status(422).json({ message: "O profissional é obrigatório!" });
    }

    const userExist = await User.findOne({ cpf: cpf });

    if (userExist) {
      return res.status(422).json({ message: "Já existe um usuário com esse CPF!" });
    }

    const hash = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, hash);

    const user = new User({
      nome,
      email,
      idade,
      image,
      password: passwordHash,
      fone,
      rg,
      sexo,
      cpf,
      endereco,
      possuiAlgumaDoencaAtualmente,
      tratamentoMedico,
      medicacaoAtualmente,
      alergiaRemedio,
      historicoDoenca,
      condicoesHemograma,
      historicoProcedimentoOdontologico,
      procedimento,
      denteface,
      valor,
      modalidade,
      profissional
    });

    try {
      await user.save();
      res.status(201).json({ message: "Usuário cadastrado com sucesso!", user });
    } catch (error) {
      res.status(500).json({ message: "Ocorreu um erro ao cadastrar o usuário, tente mais tarde!" });
    }
  }

  // Listar todos os usuários
  static async getAllUsers(req, res) {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuários." });
    }
  }

  // Atualizar usuário
  static async updateUser(req, res) {
    const { id } = req.params;
    const userData = req.body;

    if (req.file) {
      userData.image = req.file.filename;
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(id, userData, { new: true });

      if (!updatedUser) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      res.json({ message: "Usuário atualizado com sucesso!", user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar usuário." });
    }
  }

  // Deletar usuário
  static async deleteUser(req, res) {
    const { id } = req.params;

    try {
      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      res.json({ message: "Usuário excluído com sucesso!" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir usuário." });
    }
  }








  
  //Login Dentistas
  static async loginUser(req, res) {
    const { cpf, password } = req.body;

    if (!cpf || !password) {
      return res.status(422).json({ message: "CPF e senha são obrigatórios!" });
    }

    try {
      const user = await User.findOne({ cpf });
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Senha incorreta!" });
      }

      res.status(200).json({ message: "Login bem-sucedido!" });
    } catch (error) {
      res.status(500).json({ message: "Erro no servidor, tente novamente!" });
    }
  }
  
};
