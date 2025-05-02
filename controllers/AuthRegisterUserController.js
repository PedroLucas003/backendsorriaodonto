const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");


module.exports = class AuthRegisterUserController {

  static async registerUser(req, res) {
    console.log("\n--- INÍCIO DO REGISTRO DE USUÁRIO ---");
    console.log("Endpoint: POST /api/register/user");
    console.log("Horário:", new Date().toISOString());
  
    try {
      // 1. Log do corpo completo da requisição (exceto senhas)
      console.group("Corpo da requisição recebido:");
      Object.entries(req.body).forEach(([key, value]) => {
        if (key !== 'password' && key !== 'confirmPassword') {
          console.log(`${key.padEnd(25)}:`, value, `| Tipo: ${typeof value}`);
        }
      });
      console.groupEnd();
  
      // 2. Desestruturação com logs
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
  
      const image = "default-profile.jpg";
  
      // 3. Logs específicos para datas
      console.group("Debug de Datas:");
      console.log("Data Nascimento (raw):", dataNascimento, "| Tipo:", typeof dataNascimento);
      console.log("Data Procedimento (raw):", dataProcedimento, "| Tipo:", typeof dataProcedimento);
      
      const nascimentoDate = new Date(dataNascimento);
      const procedimentoDate = new Date(dataProcedimento);
      
      console.log("Data Nascimento (Date):", nascimentoDate, "| Válida?", !isNaN(nascimentoDate.getTime()));
      console.log("Data Procedimento (Date):", procedimentoDate, "| Válida?", !isNaN(procedimentoDate.getTime()));
      console.log("Comparação datas (proc > nasc):", procedimentoDate > nascimentoDate);
      console.groupEnd();
  
      // 4. Validações
      console.group("Validações:");
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
  
      // Validação de campos obrigatórios
      let missingFields = [];
      for (const [field, message] of Object.entries(requiredFields)) {
        if (!req.body[field]) {
          missingFields.push(field);
        }
      }
  
      if (missingFields.length > 0) {
        console.error("Campos obrigatórios faltando:", missingFields);
        return res.status(422).json({ 
          message: `Campos obrigatórios faltando: ${missingFields.join(", ")}`,
          missingFields
        });
      }
  
      // Validação de senha
      if (password !== confirmPassword) {
        console.error("As senhas não coincidem");
        return res.status(422).json({ message: "As senhas não são iguais!" });
      }
  
      // Verifica se usuário já existe
      const userExist = await User.findOne({ cpf: cpf });
      if (userExist) {
        console.error("CPF já cadastrado:", cpf);
        return res.status(422).json({ message: "Já existe um usuário com esse CPF!" });
      }
  
      // Validação de datas
      if (isNaN(nascimentoDate.getTime())) {
        console.error("Data de nascimento inválida:", dataNascimento);
        return res.status(422).json({ 
          message: "Data de nascimento inválida!",
          received: dataNascimento,
          expectedFormat: "YYYY-MM-DD"
        });
      }
      
      if (isNaN(procedimentoDate.getTime())) {
        console.error("Data do procedimento inválida:", dataProcedimento);
        return res.status(422).json({ 
          message: "Data do procedimento inválida!",
          received: dataProcedimento,
          expectedFormat: "YYYY-MM-DD"
        });
      }
      
      if (procedimentoDate <= nascimentoDate) {
        console.error("Problema na ordem das datas:", {
          dataNascimento: nascimentoDate.toISOString(),
          dataProcedimento: procedimentoDate.toISOString()
        });
        return res.status(422).json({ 
          message: "Data do procedimento deve ser após a data de nascimento",
          dataNascimento: nascimentoDate.toISOString().split('T')[0],
          dataProcedimento: procedimentoDate.toISOString().split('T')[0],
          help: "A data do procedimento deve ser posterior à data de nascimento"
        });
      }
  
      // Validação de valor monetário
      const valorNumerico = parseFloat(valor.toString().replace(/[^\d,]/g, '').replace(',', '.'));
      console.log("Valor convertido:", valor, "->", valorNumerico);
      
      if (isNaN(valorNumerico)) {
        console.error("Valor monetário inválido:", valor);
        return res.status(422).json({ 
          message: "Valor inválido! Use números com vírgula ou ponto decimal",
          received: valor,
          example: "250,00 ou 250.00"
        });
      }
      console.groupEnd();
  
      // 5. Criação do usuário
      console.group("Criando usuário...");
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);
  
      const user = new User({
        nomeCompleto,
        email,
        cpf,
        telefone,
        endereco,
        dataNascimento: nascimentoDate,
        dataProcedimento: procedimentoDate,
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
        modalidadePagamento,
        valor: valorNumerico
      });
  
      console.log("Usuário preparado para salvamento:", {
        nomeCompleto,
        email,
        cpf: cpf.replace(/\d(?=\d{4})/g, "*"), // Mascara o CPF parcialmente
        dataNascimento: nascimentoDate.toISOString(),
        dataProcedimento: procedimentoDate.toISOString()
      });
  
      // 6. Salvamento no banco de dados
      console.log("Salvando usuário no banco de dados...");
      await user.save();
      console.log("Usuário salvo com sucesso!");
  
      // 7. Resposta de sucesso
      const responseData = {
        message: "Usuário cadastrado com sucesso!",
        user: {
          _id: user._id,
          nomeCompleto: user.nomeCompleto,
          email: user.email,
          dataNascimento: user.dataNascimento.toISOString().split('T')[0],
          dataProcedimento: user.dataProcedimento.toISOString().split('T')[0],
          procedimento: user.procedimento,
          denteFace: user.denteFace,
          valor: user.valor
        }
      };
  
      console.group("Resposta de sucesso:");
      console.log(responseData);
      console.groupEnd();
  
      res.status(201).json(responseData);
      console.log("--- REGISTRO CONCLUÍDO COM SUCESSO ---\n");
  
    } catch (error) {
      console.group("Erro durante o registro:");
      console.error("Mensagem de erro:", error.message);
      console.error("Stack trace:", error.stack);
      
      if (error.name === "ValidationError") {
        console.error("Erros de validação:", error.errors);
      }
      
      console.groupEnd();
  
      res.status(500).json({ 
        message: "Ocorreu um erro ao cadastrar o usuário",
        error: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack,
          ...(error.errors && { validationErrors: error.errors })
        } : null
      });
      
      console.error("--- REGISTRO FALHOU ---\n");
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
        const procDate = userData.dataProcedimento ? new Date(userData.dataProcedimento) : null;
    const birthDate = userData.dataNascimento ? new Date(userData.dataNascimento) : null;

        // Validar data do procedimento
        if (procDate && isNaN(procDate.getTime())) {
          return res.status(400).json({ 
            message: "Data do procedimento inválida!",
            received: userData.dataProcedimento
          });
        }

        // Validar data de nascimento
        if (birthDate && isNaN(birthDate.getTime())) {
          return res.status(400).json({ 
            message: "Data de nascimento inválida!",
            received: userData.dataNascimento
          });
        }

        const existingBirthDate = new Date(existingUser.dataNascimento);
    const finalBirthDate = birthDate || existingBirthDate;
    
    if (procDate && procDate <= finalBirthDate) {
      return res.status(400).json({
        message: "Data do procedimento deve ser após a data de nascimento",
        dataNascimento: finalBirthDate.toISOString().split('T')[0],
        dataProcedimento: procDate.toISOString().split('T')[0]
      });
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

        // Atualizar hábitos - SEMPRE atualize o objeto completo de hábitos
        userData.habitos = {
            frequenciaFumo: userData.frequenciaFumo || existingUser.habitos?.frequenciaFumo || "",
            frequenciaAlcool: userData.frequenciaAlcool || existingUser.habitos?.frequenciaAlcool || ""
        };

        // Remover os campos individuais para evitar duplicação
        delete userData.frequenciaFumo;
        delete userData.frequenciaAlcool;

        // Atualizar o usuário no banco
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: userData },
            { 
                new: true, 
                runValidators: false, // Não usar validações automáticas do Mongoose
                lean: true // Retorna objeto JavaScript simples
            }
        );

        // Preparar resposta incluindo os campos no nível raiz para o frontend
        const responseUser = {
            ...updatedUser,
            frequenciaFumo: updatedUser.habitos?.frequenciaFumo || "",
            frequenciaAlcool: updatedUser.habitos?.frequenciaAlcool || ""
        };

        res.json({
            message: "Usuário atualizado com sucesso!",
            user: responseUser
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

    // Ordenar procedimentos por data (mais recente primeiro)
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
      cpf: user.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4"),
      telefone: user.telefone,
      endereco: user.endereco,
      dataNascimento: user.dataNascimento ? new Date(user.dataNascimento).toISOString().split('T')[0] : null,
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
  const { 
    dataProcedimento, 
    procedimento, 
    denteFace, 
    valor, 
    modalidadePagamento, 
    profissional
  } = req.body;

  // Validação dos campos obrigatórios
  const requiredFields = {
    dataProcedimento: "Data do procedimento é obrigatória",
    procedimento: "Procedimento é obrigatório",
    denteFace: "Dente/Face é obrigatório",
    valor: "Valor é obrigatório",
    modalidadePagamento: "Modalidade de pagamento é obrigatória",
    profissional: "Profissional é obrigatório"
  };

  const errors = {};
  for (const [field, message] of Object.entries(requiredFields)) {
    if (!req.body[field] || req.body[field].toString().trim() === "") {
      errors[field] = message;
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({ 
      message: "Campos obrigatórios faltando",
      errors 
    });
  }

  try {
    // Busca o usuário
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado!" });
    }

    // Usa a função auxiliar para formatar a data
    const formattedDate = formatDateForInput(dataProcedimento);
    const procDate = new Date(formattedDate);
    
    if (isNaN(procDate.getTime())) {
      return res.status(400).json({ 
        message: "Data inválida! Use o formato YYYY-MM-DD",
        receivedValue: dataProcedimento,
        example: "2023-12-31"
      });
    }

    // Validação contra data de nascimento
    const birthDate = new Date(user.dataNascimento);
    if (procDate < birthDate) {
      return res.status(400).json({
        message: "Data do procedimento não pode ser antes da data de nascimento",
        dataNascimento: birthDate.toISOString().split('T')[0],
        dataProcedimento: procDate.toISOString().split('T')[0],
        help: "A data do procedimento deve ser posterior a " + birthDate.toLocaleDateString('pt-BR')
      });
    }

    // Usa a função auxiliar para converter o valor
    const valorNumerico = convertValueToFloat(valor);
    if (valorNumerico <= 0) {
      return res.status(400).json({ 
        message: "Valor deve ser maior que zero",
        receivedValue: valor,
        convertedValue: valorNumerico
      });
    }

    // Criação do procedimento
    const novoProcedimento = {
      dataProcedimento: procDate,
      procedimento: procedimento.trim(),
      denteFace: denteFace.trim(),
      valor: valorNumerico,
      modalidadePagamento: modalidadePagamento.trim(),
      profissional: profissional.trim(),
      createdAt: new Date()
    };

    // Atualização do usuário
    const usuarioAtualizado = await User.findByIdAndUpdate(
      id,
      { $push: { historicoProcedimentos: novoProcedimento } },
      { new: true }
    ).select('-password');

    // Resposta formatada
    res.status(201).json({
      message: "Procedimento adicionado com sucesso!",
      procedimento: {
        ...novoProcedimento,
        dataProcedimento: formatDateForInput(novoProcedimento.dataProcedimento),
        valor: valorNumerico
      },
      user: {
        _id: usuarioAtualizado._id,
        nomeCompleto: usuarioAtualizado.nomeCompleto,
        totalProcedimentos: usuarioAtualizado.historicoProcedimentos.length
      }
    });

  } catch (error) {
    console.error("Erro ao adicionar procedimento:", {
      error: error.message,
      stack: error.stack,
      inputData: {
        params: req.params,
        body: req.body
      }
    });

    res.status(500).json({ 
      message: "Erro ao adicionar procedimento",
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
}
};