const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require('express-validator');

// Função para formatar erros do Mongoose (Mantido)
const formatMongooseErrors = (error) => {
    if (!error.errors) return null;

    const errors = {};
    Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
    });
    return errors;
};

// Função para validar dados antes de salvar (Mantido)
const validateUserData = (userData) => {
    const errors = {};
    if (userData.password && userData.password.length < 6) {
        errors.password = "A senha deve ter pelo menos 6 caracteres";
    }
    return Object.keys(errors).length > 0 ? errors : null;
};

module.exports = class AuthRegisterUserController {
    static async registerUser(req, res) {
        try {
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

            if (userData.password !== userData.confirmPassword) {
                return res.status(422).json({
                    message: "Erro de validação",
                    errors: { confirmPassword: "As senhas não coincidem!" }
                });
            }

            const validationErrors = validateUserData(userData);
            if (validationErrors) {
                return res.status(400).json({
                    message: "Erro de validação",
                    errors: validationErrors
                });
            }

            userData.password = await bcrypt.hash(userData.password, 12);
            const user = await User.create(userData);
            const userResponse = user.toObject();
            delete userResponse.password;

            res.status(201).json({
                message: "Usuário cadastrado com sucesso!",
                user: userResponse
            });
        } catch (error) {
            console.error("Erro ao cadastrar usuário:", error);
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
            const oldToken = req.headers.authorization?.split(' ')[1];
            if (!oldToken) {
                return res.status(401).json({ message: "Token não fornecido" });
            }
            const decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });
            const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
                expiresIn: "30d"
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
            const { removerArquivo, ...procedimentoData } = req.body; // Separa o campo 'removerArquivo'

            // ... (suas validações de campos obrigatórios)

            const camposParaAtualizar = {
                'historicoProcedimentos.$.procedimento': procedimentoData.procedimento,
                'historicoProcedimentos.$.denteFace': procedimentoData.denteFace,
                'historicoProcedimentos.$.valor': Number(procedimentoData.valor),
                'historicoProcedimentos.$.modalidadePagamento': procedimentoData.modalidadePagamento,
                'historicoProcedimentos.$.profissional': procedimentoData.profissional,
                'historicoProcedimentos.$.dataProcedimento': new Date(procedimentoData.dataProcedimento)
            };

            // --- LÓGICA DE ATUALIZAÇÃO DE ARQUIVO AJUSTADA ---
        if (req.files && req.files.length > 0) {
            // Se novos arquivos foram enviados, substitui todos os antigos.
            camposParaAtualizar['historicoProcedimentos.$.arquivos'] = req.files.map(file => file.filename);
        } else if (removerArquivos === 'true') {
            // Se a flag de remover veio, esvazia o array de arquivos.
            camposParaAtualizar['historicoProcedimentos.$.arquivos'] = [];
        }
        // Se nenhuma dessas condições for atendida, o array de arquivos não é modificado.

        const updatedUser = await User.findOneAndUpdate(
            { _id: id, "historicoProcedimentos._id": procedimentoId },
            { $set: camposParaAtualizar },
            { new: true, runValidators: true }
        );

            const procedimentoAtualizado = updatedUser.historicoProcedimentos.find(
                p => p._id.toString() === procedimentoId
            );

            res.status(200).json({
                message: "Procedimento atualizado com sucesso!",
                procedimento: procedimentoAtualizado
            });

        } catch (error) {
            // Agora o log de erro faz todo sentido!
            console.error("Erro CRÍTICO ao atualizar procedimento:", error);

            res.status(500).json({
                message: "Erro interno no servidor ao tentar atualizar o procedimento.",
                error: process.env.NODE_ENV === 'development' ? error.message : "INTERNAL_SERVER_ERROR"
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
                    message: "Usuário ou procedimento não encontrado",
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

            // 1. Cria uma cópia dos dados recebidos para evitar modificar o objeto original
            const updateFields = { ...userData };

            // 2. Se uma nova senha foi enviada, faz o hash dela
            if (userData.password && userData.password.length >= 6) {
                updateFields.password = await bcrypt.hash(userData.password, 12);
            } else {
                // Remove os campos de senha se não forem válidos para não salvar "undefined"
                delete updateFields.password;
                delete updateFields.confirmPassword;
            }

            // 3. Converte a string de data de nascimento para o formato Date do MongoDB
            // O frontend envia a data no formato ISO (ex: "2025-08-09T15:00:00.000Z")
            if (userData.dataNascimento) {
                const dateObj = new Date(userData.dataNascimento);
                // Verifica se a data é válida antes de atribuir
                if (!isNaN(dateObj.getTime())) {
                    updateFields.dataNascimento = dateObj;
                } else {
                    // Se a data for inválida, remove do objeto para não dar erro
                    delete updateFields.dataNascimento;
                }
            }

            // 4. (NOVO) Converte a string da data do procedimento para o formato Date
            if (userData.dataProcedimento) {
                const dateObj = new Date(userData.dataProcedimento);
                if (!isNaN(dateObj.getTime())) {
                    updateFields.dataProcedimento = dateObj;
                } else {
                    delete updateFields.dataProcedimento;
                }
            }

            // 5. Executa a atualização no banco de dados
            // O operador `$set` garante que apenas os campos enviados em `updateFields` sejam atualizados
            const updatedUser = await User.findByIdAndUpdate(
                id,
                { $set: updateFields },
                {
                    new: true,          // Retorna o documento já atualizado
                    runValidators: true,  // Garante que as validações do Schema sejam aplicadas
                    lean: true            // Retorna um objeto JavaScript simples
                }
            ).select('-password'); // Garante que a senha não seja retornada na resposta

            // Verifica se o usuário foi encontrado e atualizado
            if (!updatedUser) {
                return res.status(404).json({
                    message: "Usuário não encontrado.",
                    error: "NOT_FOUND"
                });
            }

            // 6. Envia a resposta de sucesso com o usuário atualizado
            res.status(200).json({
                message: "Usuário atualizado com sucesso!",
                user: updatedUser
            });

        } catch (error) {
            // Tratamento de erros
            console.error("Erro ao atualizar usuário:", error);

            if (error.name === 'ValidationError') {
                const mongooseErrors = formatMongooseErrors(error); // Supondo que você tenha essa função
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

    // ***** FUNÇÃO loginUser REVERTIDA PARA A LÓGICA ORIGINAL *****
    static async loginUser(req, res) {
        try {
            const { cpf, password } = req.body;

            if (!cpf || !password) {
                return res.status(422).json({
                    message: "CPF e senha são obrigatórios",
                    error: "MISSING_CREDENTIALS"
                });
            }

            // A busca agora usa o 'cpf' como vem da requisição
            // Se o seu banco armazena o CPF com pontos e traços, o frontend
            // do login precisa enviar com pontos e traços.
            const user = await User.findOne({ cpf: cpf }).select('+password').lean(); // VOLTOU A USAR 'cpf' DIRETO

            if (!user) {
                return res.status(401).json({
                    message: "Credenciais inválidas",
                    error: "INVALID_CREDENTIALS"
                });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    message: "Credenciais inválidas",
                    error: "INVALID_CREDENTIALS"
                });
            }

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: "24h"
            });

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

    // ***** FUNÇÃO getProntuario COM AS MELHORIAS RECENTES *****
    static async getProntuario(req, res) {
        try {
            const { cpf, password } = req.body; // CPF virá formatado do frontend (ex: "122.061.544-71")

            // 1. Validação básica
            if (!cpf || !password) {
                return res.status(422).json({
                    message: "Por favor, preencha todos os campos.",
                    errors: {
                        cpf: !cpf ? "CPF é obrigatório" : undefined,
                        password: !password ? "Senha é obrigatória" : undefined
                    }
                });
            }

            // 2. Valida o formato do CPF (essencial, pois o Schema espera assim)
            const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
            if (!cpfRegex.test(cpf)) {
                return res.status(400).json({
                    message: "Formato de CPF inválido. Use: 000.000.000-00 (com pontos e traço).",
                });
            }

            // 3. Busca o paciente COM o CPF formatado (igual ao banco)
            const user = await User.findOne({ cpf: cpf }).select('+password');

            if (!user) {
                return res.status(404).json({
                    message: "Paciente não encontrado! Verifique o CPF.",
                    error: "NOT_FOUND"
                });
            }

            // 4. Valida a senha
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    message: "Senha incorreta!",
                    error: "INVALID_CREDENTIALS"
                });
            }

            // 5. Formata e organiza os dados do prontuário para envio ao frontend
            const prontuario = {
                dadosPessoais: {
                    nomeCompleto: user.nomeCompleto,
                    cpf: user.cpf, // Já está formatado do banco
                    telefone: user.telefone,
                    endereco: user.endereco,
                    dataNascimento: user.dataNascimento ? new Date(user.dataNascimento).toLocaleDateString('pt-BR') : '-',
                },
                saude: {
                    detalhesDoencas: user.detalhesDoencas,
                    quaisRemedios: user.quaisRemedios,
                    quaisMedicamentos: user.quaisMedicamentos,
                    quaisAnestesias: user.quaisAnestesias,
                    historicoCirurgia: user.historicoCirurgia,
                    respiracao: user.respiracao,
                    peso: user.peso,
                },
                habitos: {
                    frequenciaFumo: user.habitos?.frequenciaFumo, // Use optional chaining para campos aninhados
                    frequenciaAlcool: user.habitos?.frequenciaAlcool,
                },
                exames: {
                    exameSangue: user.exames?.exameSangue,
                    coagulacao: user.exames?.coagulacao,
                    cicatrizacao: user.exames?.cicatrizacao,
                    sangramentoPosProcedimento: user.sangramentoPosProcedimento,
                },
                odontologico: {
                    historicoOdontologico: user.historicoOdontologico,
                },
                // Mapeia o array de procedimentos, formatando datas se existirem
                procedimentos: user.historicoProcedimentos.map(proc => ({
                    procedimento: proc.procedimento,
                    denteFace: proc.denteFace,
                    valor: proc.valor,
                    modalidadePagamento: proc.modalidadePagamento,
                    profissional: proc.profissional,
                    // Garante que a data é um objeto Date antes de formatar
                    dataProcedimento: proc.dataProcedimento ? new Date(proc.dataProcedimento).toLocaleDateString('pt-BR') : '-',
                    dataNovoProcedimento: proc.dataNovoProcedimento ? new Date(proc.dataNovoProcedimento).toLocaleDateString('pt-BR') : '-',
                    isPrincipal: false, // Você pode adicionar lógica aqui se tiver um procedimento principal
                }))
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
                message: "Erro interno no servidor ao buscar prontuário.",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    static async addProcedimento(req, res) {
        try {
            const { id } = req.params;
            const procedimentoData = req.body;

            // CORREÇÃO AQUI: Não converte a data, pois o frontend já envia um objeto Date
            if (!procedimentoData.dataProcedimento || isNaN(new Date(procedimentoData.dataProcedimento).getTime())) {
                return res.status(400).json({
                    message: "Data inválida ou ausente.",
                    error: "INVALID_DATE"
                });
            }

            const novoProcedimento = {
                procedimento: procedimentoData.procedimento,
                denteFace: procedimentoData.denteFace,
                valor: procedimentoData.valor,
                modalidadePagamento: procedimentoData.modalidadePagamento,
                profissional: procedimentoData.profissional,
                dataProcedimento: new Date(procedimentoData.dataProcedimento) // Usa a data como objeto
            };

            if (req.files && req.files.length > 0) {
            novoProcedimento.arquivos = req.files.map(file => file.filename);
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $push: { historicoProcedimentos: novoProcedimento } },
            { new: true, runValidators: true }
        );

            if (!updatedUser) {
                return res.status(404).json({
                    message: "Usuário não encontrado.",
                    error: "NOT_FOUND"
                });
            }

            const ultimoProcedimento = updatedUser.historicoProcedimentos[updatedUser.historicoProcedimentos.length - 1];
            res.status(201).json({
                message: "Procedimento adicionado com sucesso!",
                procedimento: ultimoProcedimento
            });
        } catch (error) {
            console.error("Erro ao adicionar procedimento:", error);
            res.status(500).json({
                message: error.message || "Erro interno no servidor"
            });
        }
    }
};