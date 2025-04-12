import React, { useState, useEffect } from "react";
import api from "./api/api";
import "./RegisterUser.css";

const RegisterUser = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    cpf: "",
    telefone: "",
    endereco: "",
    dataNascimento: "",
    password: "",
    confirmPassword: "",
    detalhesDoencas: "",
    quaisRemedios: "",
    quaisAnestesias: "",
    frequenciaFumo: "",
    frequenciaAlcool: "",
    historicoCirurgia: "",
    exameSangue: "",
    coagulacao: "",
    cicatrizacao: "",
    historicoOdontologico: "",
    sangramentoPosProcedimento: "",
    respiracao: "",
    peso: "",
    profissional: "",
    dataProcedimento: "",
    modalidadePagamento: "",
    valor: "",
    image: null,
  });

  const [usuarios, setUsuarios] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [imagemModal, setImagemModal] = useState(null);

  // Opções para selects
  const modalidadesPagamento = [
    "Dinheiro",
    "Cartão de Crédito",
    "Cartão de Débito",
    "PIX",
    "Boleto",
    "Convênio"
  ];

  const frequencias = [
    "Nunca",
    "Raramente",
    "Ocasionalmente",
    "Frequentemente",
    "Diariamente"
  ];

  const opcoesSimNao = [
    "Sim",
    "Não",
    "Não sei"
  ];

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  const formatCPF = (value) => {
    const cleanedValue = value.replace(/\D/g, "");
    let formattedValue = cleanedValue.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    if (cleanedValue.length <= 3) {
      formattedValue = cleanedValue;
    } else if (cleanedValue.length <= 6) {
      formattedValue = `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3)}`;
    } else if (cleanedValue.length <= 9) {
      formattedValue = `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3, 6)}.${cleanedValue.slice(6)}`;
    } else if (cleanedValue.length <= 11) {
      formattedValue = `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3, 6)}.${cleanedValue.slice(6, 9)}-${cleanedValue.slice(9)}`;
    }
    return formattedValue;
  };

  const formatFone = (value) => {
    const cleanedValue = value.replace(/\D/g, "");
    let formattedValue = cleanedValue.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    if (cleanedValue.length <= 2) {
      formattedValue = cleanedValue;
    } else if (cleanedValue.length <= 7) {
      formattedValue = `(${cleanedValue.slice(0, 2)}) ${cleanedValue.slice(2)}`;
    } else if (cleanedValue.length <= 11) {
      formattedValue = `(${cleanedValue.slice(0, 2)}) ${cleanedValue.slice(2, 7)}-${cleanedValue.slice(7)}`;
    }
    return formattedValue;
  };

  const formatValor = (value) => {
    const cleanedValue = value.replace(/\D/g, "");
    const formattedValue = (cleanedValue / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return formattedValue;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    if (name === "cpf") {
      formattedValue = formatCPF(value);
    } else if (name === "telefone") {
      formattedValue = formatFone(value);
    } else if (name === "valor") {
      formattedValue = formatValor(value);
    } else {
      formattedValue = value;
    }

    setFormData((prevData) => ({ ...prevData, [name]: formattedValue }));
  };

  const handleFileChange = (e) => {
    setFormData((prevData) => ({ ...prevData, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar campos obrigatórios
    const requiredFields = {
      nomeCompleto: "O nome completo é obrigatório!",
      email: "O email é obrigatório!",
      cpf: "O CPF é obrigatório!",
      telefone: "O telefone é obrigatório!",
      endereco: "O endereço é obrigatório!",
      dataNascimento: "A data de nascimento é obrigatória!",
      detalhesDoencas: "Os detalhes sobre doenças são obrigatórios!",
      quaisRemedios: "Informação sobre medicamentos é obrigatória!",
      historicoCirurgia: "O histórico cirúrgico é obrigatório!",
      profissional: "O profissional é obrigatório!",
      dataProcedimento: "A data do procedimento é obrigatória!",
      modalidadePagamento: "A modalidade de pagamento é obrigatória!",
      valor: "O valor é obrigatório!"
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        alert(message);
        return;
      }
    }

    if (!editandoId && (!formData.password || !formData.confirmPassword)) {
      alert("A senha e confirmação são obrigatórias para novo cadastro!");
      return;
    }

    if (!editandoId && formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    const token = localStorage.getItem("token");
    const formDataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "image") {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      } else {
        let value = formData[key];
        
        if (key === "cpf" || key === "telefone") {
          value = value.replace(/\D/g, "");
        } else if (key === "valor") {
          value = value.replace(/[^\d,]/g, "").replace(",", ".");
        }
        
        if ((key === "password" || key === "confirmPassword") && !value && editandoId) {
          return;
        }
        
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      }
    });

    try {
      if (editandoId) {
        await api.put(`/auth/users/${editandoId}`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        });
        alert("Usuário atualizado com sucesso!");
      } else {
        await api.post("/auth/register/user", formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        });
        alert("Usuário cadastrado com sucesso!");
      }

      setFormData({
        nomeCompleto: "",
        email: "",
        cpf: "",
        telefone: "",
        endereco: "",
        dataNascimento: "",
        password: "",
        confirmPassword: "",
        detalhesDoencas: "",
        quaisRemedios: "",
        quaisAnestesias: "",
        frequenciaFumo: "",
        frequenciaAlcool: "",
        historicoCirurgia: "",
        exameSangue: "",
        coagulacao: "",
        cicatrizacao: "",
        historicoOdontologico: "",
        sangramentoPosProcedimento: "",
        respiracao: "",
        peso: "",
        profissional: "",
        dataProcedimento: "",
        modalidadePagamento: "",
        valor: "",
        image: null,
      });
      setEditandoId(null);
      fetchUsuarios();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      alert(`Erro ao salvar usuário: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (usuario) => {
    setEditandoId(usuario._id);

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
    };

    setFormData({
      ...usuario,
      cpf: formatCPF(usuario.cpf),
      telefone: formatFone(usuario.telefone),
      dataNascimento: formatDate(usuario.dataNascimento),
      dataProcedimento: formatDate(usuario.dataProcedimento),
      password: "",
      confirmPassword: "",
      image: null,
      historicoCirurgia: usuario.historicoCirurgia || "",
      historicoOdontologico: usuario.historicoOdontologico || ""
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/auth/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Usuário excluído com sucesso!");
        fetchUsuarios();
      } catch (error) {
        alert("Erro ao excluir usuário.");
      }
    }
  };

  const handleViewImage = (image) => {
    setImagemModal(image);
  };

  const closeModal = () => {
    setImagemModal(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const labels = {
    nomeCompleto: "Nome completo *",
    email: "E-mail *",
    cpf: "CPF *",
    telefone: "Telefone *",
    endereco: "Endereço *",
    dataNascimento: "Data de nascimento *",
    password: "Senha" + (editandoId ? "" : " *"),
    confirmPassword: "Confirmar senha" + (editandoId ? "" : " *"),
    detalhesDoencas: "Detalhes de doenças *",
    quaisRemedios: "Quais remédios *",
    quaisAnestesias: "Quais anestesias",
    frequenciaFumo: "Frequência de fumo",
    frequenciaAlcool: "Frequência de álcool",
    historicoCirurgia: "Histórico de cirurgia *",
    exameSangue: "Exame de sangue",
    coagulacao: "Coagulação",
    cicatrizacao: "Cicatrização",
    historicoOdontologico: "Histórico odontológico",
    sangramentoPosProcedimento: "Sangramento pós-procedimento",
    respiracao: "Respiração",
    peso: "Peso",
    profissional: "Profissional *",
    dataProcedimento: "Data do procedimento *",
    modalidadePagamento: "Modalidade de pagamento *",
    valor: "Valor *"
  };

  return (
    <div className={`container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="theme-toggle">
        <button onClick={toggleDarkMode} className="theme-btn">
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
      <h1>Cadastro de Usuário</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-section">
          <h2>Dados Pessoais</h2>
          <div className="form-grid">
            {['nomeCompleto', 'email', 'cpf', 'telefone', 'endereco', 'dataNascimento', 'password', 'confirmPassword'].map((key) => (
              <div key={key} className="form-group">
                <label htmlFor={key}>{labels[key]}</label>
                <input
                  type={key.includes("password")
                    ? "password"
                    : key === "dataNascimento"
                    ? "date"
                    : "text"}
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required={(key !== 'password' && key !== 'confirmPassword') || !editandoId}                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Histórico de Saúde</h2>
          <div className="form-grid">
            {['detalhesDoencas', 'quaisRemedios', 'quaisAnestesias', 'frequenciaFumo', 
              'frequenciaAlcool', 'exameSangue', 'coagulacao', 'cicatrizacao', 
              'sangramentoPosProcedimento', 'respiracao', 'peso'].map((key) => (
              <div key={key} className="form-group">
                <label htmlFor={key}>{labels[key]}</label>
                {key === 'frequenciaFumo' || key === 'frequenciaAlcool' ? (
                  <select
                    id={key}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                  >
                    <option value="">Selecione...</option>
                    {frequencias.map((opcao) => (
                      <option key={opcao} value={opcao}>{opcao}</option>
                    ))}
                  </select>
                ) : key === 'exameSangue' || key === 'coagulacao' || key === 'cicatrizacao' ? (
                  <select
                    id={key}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                  >
                    <option value="">Selecione...</option>
                    {opcoesSimNao.map((opcao) => (
                      <option key={opcao} value={opcao}>{opcao}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id={key}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    required={key === 'detalhesDoencas' || key === 'quaisRemedios'}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Histórico Médico e Odontológico</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="historicoCirurgia">{labels.historicoCirurgia}</label>
              <textarea
                id="historicoCirurgia"
                name="historicoCirurgia"
                value={formData.historicoCirurgia}
                onChange={handleChange}
                rows={5}
                required
                className="large-text-area"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="historicoOdontologico">{labels.historicoOdontologico}</label>
              <textarea
                id="historicoOdontologico"
                name="historicoOdontologico"
                value={formData.historicoOdontologico}
                onChange={handleChange}
                rows={5}
                className="large-text-area"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Dados do Procedimento</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="profissional">{labels.profissional}</label>
              <input
                type="text"
                id="profissional"
                name="profissional"
                value={formData.profissional}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dataProcedimento">{labels.dataProcedimento}</label>
              <input
                type="date"
                id="dataProcedimento"
                name="dataProcedimento"
                value={formData.dataProcedimento}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="modalidadePagamento">{labels.modalidadePagamento}</label>
              <select
                id="modalidadePagamento"
                name="modalidadePagamento"
                value={formData.modalidadePagamento}
                onChange={handleChange}
                required
              >
                <option value="">Selecione...</option>
                {modalidadesPagamento.map((opcao) => (
                  <option key={opcao} value={opcao}>{opcao}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="valor">{labels.valor}</label>
              <input
                type="text"
                id="valor"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Upload de Imagem</h2>
          <div className="form-group">
            <label htmlFor="image">Imagem</label>
            <input
              type="file"
              id="image"
              name="image"
              accept=".png, .jpg, .jpeg"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <button type="submit" className="btn">
          <span className="btnText">{editandoId ? "Atualizar" : "Cadastrar"}</span>
          <i className="bi bi-cloud-upload"></i>
        </button>
      </form>

      <h2>Usuários Cadastrados</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Imagem</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario._id}>
                <td>{usuario.nomeCompleto}</td>
                <td>{formatCPF(usuario.cpf)}</td>
                <td>{formatFone(usuario.telefone)}</td>
                <td>
                  {usuario.image && (
                    <button
                      onClick={() => handleViewImage(usuario.image)}
                      className="btn-view"
                    >
                      Imagem
                    </button>
                  )}
                </td>
                <td>
                  <div className="actions">
                    <button
                      onClick={() => handleEdit(usuario)}
                      className="btn-edit"
                    >
                      <span className="btnText">Editar</span>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(usuario._id)}
                      className="btn-delete"
                    >
                      <span className="btnText">Excluir</span>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {imagemModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>×</span>
            <img
              src={`${api.defaults.baseURL}/uploads/${imagemModal}`}
              alt="Imagem do usuário"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterUser;