const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = class AuthRegisterUserController {
  static async init(req, res) {
    res.send({ message: "Bem-vindo à nossa API!" });
  }
  
  static async healthCheck(req, res) {
    const checks = {
      database: {
        status: 'OK',
        latency: 0,
        details: {}
      },
      memory: {
        status: 'OK',
        details: {}
      },
      disk: {
        status: 'OK',
        details: {}
      }
    };
  
    try {
      // Teste de conexão com MongoDB
      const dbStart = Date.now();
      await mongoose.connection.db.admin().ping();
      checks.database.latency = Date.now() - dbStart;
      checks.database.details.connectionState = mongoose.connection.readyState;
  
      // Verificação de memória
      const memoryUsage = process.memoryUsage();
      checks.memory.details = {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`
      };
  
      // Verificação de espaço em disco (exemplo para Linux)
      if (process.platform === 'linux') {
        const checkDiskSpace = require('check-disk-space').default;
        const disk = await checkDiskSpace('/');
        checks.disk.details = {
          free: `${(disk.free / 1024 / 1024 / 1024).toFixed(2)} GB`,
          size: `${(disk.size / 1024 / 1024 / 1024).toFixed(2)} GB`
        };
      }
  
      // Status geral
      const allOk = Object.values(checks).every(c => c.status === 'OK');
      res.status(allOk ? 200 : 503).json({
        status: allOk ? 'UP' : 'PARTIAL',
        checks,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: require('../package.json').version // Adicione sua versão
      });
  
    } catch (error) {
      checks.database.status = 'ERROR';
      checks.database.details.error = error.message;
      
      res.status(503).json({
        status: 'DOWN',
        checks,
        error: "Service Unavailable",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    }
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
      quaisMedicamentos,
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
      quaisMedicamentos: "Informação sobre medicamentos é obrigatória!",
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
      quaisMedicamentos,
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
        // Carregar o usuário existente
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // Garantir que as datas sejam objetos Date e ignorem horas
        const procDate = userData.dataProcedimento
            ? new Date(userData.dataProcedimento).setHours(0, 0, 0, 0)
            : null;
        const birthDate = userData.dataNascimento
            ? new Date(userData.dataNascimento).setHours(0, 0, 0, 0)
            : new Date(existingUser.dataNascimento).setHours(0, 0, 0, 0);

        // Validar data do procedimento
        if (procDate && procDate < birthDate) {
            return res.status(400).json({
                error: true,
                message: "Data do procedimento não pode ser antes da data de nascimento.",
            });
        }

        // Validar data de nascimento
        if (userData.dataNascimento) {
            const existingProcDate = new Date(existingUser.dataProcedimento).setHours(0, 0, 0, 0);
            if (birthDate > existingProcDate) {
                return res.status(400).json({
                    error: true,
                    message: "Data de nascimento não pode ser depois da data do procedimento.",
                });
            }
        }

        // Atualizar imagem, se necessário
        if (req.file) {
            userData.image = req.file.filename;
        } else {
            userData.image = existingUser.image;
        }

        // Atualizar senha, se necessário
        if (!userData.password) {
            userData.password = existingUser.password;
        } else {
            const salt = await bcrypt.genSalt(12);
            userData.password = await bcrypt.hash(userData.password, salt);
        }

        // Atualizar exames, se necessário
        if (userData.exameSangue || userData.coagulacao || userData.cicatrizacao) {
            userData.exames = {
                exameSangue: userData.exameSangue || existingUser.exames?.exameSangue,
                coagulacao: userData.coagulacao || existingUser.exames?.coagulacao,
                cicatrizacao: userData.cicatrizacao || existingUser.exames?.cicatrizacao,
            };
        }

        // Atualizar hábitos, se necessário
        if (userData.frequenciaFumo || userData.frequenciaAlcool) {
            userData.habitos = {
                frequenciaFumo: userData.frequenciaFumo || existingUser.habitos?.frequenciaFumo,
                frequenciaAlcool: userData.frequenciaAlcool || existingUser.habitos?.frequenciaAlcool,
            };
        }

        // Atualizar o usuário no banco
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: userData },
            { new: true, runValidators: false } // Não usar validações automáticas do Mongoose
        );

        res.json({
            message: "Usuário atualizado com sucesso!",
            user: updatedUser,
        });
    } catch (error) {
        console.error(error);

        if (error.name === "ValidationError") {
            const errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            return res.status(400).json({
                error: true,
                message: "Erro de validação",
                errors,
            });
        }

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
        // Busca TODOS os usuários (para debug - remova depois)
        const allUsers = await User.find({});

        // Busca o usuário pelo CPF (formatado ou não)
        const user = await User.findOne({ 
            $or: [
                { cpf: cpfLimpo },
                { cpf: cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") }
            ]
        }).select('+password');
        
        if (!user) {
            console.log("Usuário não encontrado para o CPF:", cpfLimpo);
            return res.status(403).json({ message: "Acesso não autorizado: usuário não encontrado." });
        }

        // Verifica a senha
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Senha incorreta!" });
        }

        // Gera o token
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
        console.error("Erro completo:", error);
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
  
      // Criar array de procedimentos combinando o principal e o histórico
      const todosProcedimentos = [
        {
          dataProcedimento: user.dataProcedimento,
          procedimento: user.procedimento,
          denteFace: user.denteFace,
          valor: user.valor,
          modalidadePagamento: user.modalidadePagamento,
          profissional: user.profissional,
          isPrincipal: true
        },
        ...(user.historicoProcedimentos || []).map(p => ({ ...p.toObject(), isPrincipal: false }))
      ].sort((a, b) => new Date(b.dataProcedimento) - new Date(a.dataProcedimento));
  
      // Retorna os dados formatados
      const prontuario = {
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        cpf: user.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4"),
        telefone: user.telefone,
        endereco: user.endereco,
        dataNascimento: user.dataNascimento,
        detalhesDoencas: user.detalhesDoencas,
        quaisRemedios: user.quaisRemedios,
        quaisMedicamentos: user.quaisMedicamentos,
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
    const { 
      dataProcedimento, 
      procedimento, 
      denteFace, 
      valor, 
      modalidadePagamento, 
      profissional
    } = req.body;
  
    if (!dataProcedimento || !procedimento || !denteFace || !valor || !modalidadePagamento || !profissional) {
      return res.status(422).json({ message: "Todos os campos obrigatórios devem ser preenchidos!" });
    }
  
    try {
      // Busca o usuário completo para validação
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
      }
  
      // Validação manual da data
      const procDate = new Date(dataProcedimento);
      const birthDate = new Date(user.dataNascimento);
      
      if (procDate < birthDate) {
        return res.status(400).json({
          message: "Data do procedimento não pode ser antes da data de nascimento"
        });
      }
  
      // Formata o valor
      const valorNumerico = parseFloat(
        String(valor).replace(/[^\d,]/g, '').replace(',', '.')
      );
  
      if (isNaN(valorNumerico)) {
        return res.status(400).json({ message: "Valor inválido" });
      }
  
      const novoProcedimento = {
        dataProcedimento: procDate,
        procedimento: procedimento.trim(),
        denteFace: denteFace.trim(),
        valor: valorNumerico,
        modalidadePagamento,
        profissional: profissional.trim(),
        createdAt: new Date()
      };
  
      // Atualiza apenas o histórico
      const usuarioAtualizado = await User.findByIdAndUpdate(
        id,
        { $push: { historicoProcedimentos: novoProcedimento } },
        { new: true }
      );
  
      res.status(201).json({
        message: "Procedimento adicionado com sucesso!",
        user: usuarioAtualizado
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