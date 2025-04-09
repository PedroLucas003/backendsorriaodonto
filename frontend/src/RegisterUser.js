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
    let cleanedValue = value.replace(/\D/g, "");

    let formattedValue = value;
    if (name === "cpf") {
      formattedValue = formatCPF(cleanedValue);
    } else if (name === "telefone") {
      formattedValue = formatFone(cleanedValue);
    } else if (name === "valor") {
      formattedValue = formatValor(cleanedValue);
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
    const token = localStorage.getItem("token");
    const formDataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      let value = formData[key];
      if (key === "cpf" || key === "telefone") {
        value = value.replace(/\D/g, "");
      } else if (key === "valor") {
        value = value.replace(/[^0-9]/g, "");
      }

      if ((key === "password" || key === "confirmPassword") && !value) {
        return;
      }

      formDataToSend.append(key, value);
    });

    try {
      if (editandoId) {
        await api.put(`/auth/users/${editandoId}`, formDataToSend, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Usuário atualizado com sucesso!");
      } else {
        await api.post("/auth/register/user", formDataToSend, {
          headers: { Authorization: `Bearer ${token}` },
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
      alert("Erro ao salvar usuário.");
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
      dataNascimento: formatDate(usuario.dataNascimento),
      dataProcedimento: formatDate(usuario.dataProcedimento),
      password: "",
      confirmPassword: "",
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
    nomeCompleto: "Nome completo",
    email: "E-mail",
    cpf: "CPF",
    telefone: "Telefone",
    endereco: "Endereço",
    dataNascimento: "Data de nascimento",
    password: "Senha",
    confirmPassword: "Confirmar senha",
    detalhesDoencas: "Detalhes de doenças",
    quaisRemedios: "Quais remédios",
    quaisAnestesias: "Quais anestesias",
    frequenciaFumo: "Frequência de fumo",
    frequenciaAlcool: "Frequência de álcool",
    historicoCirurgia: "Histórico de cirurgia",
    exameSangue: "Exame de sangue",
    coagulacao: "Coagulação",
    cicatrizacao: "Cicatrização",
    historicoOdontologico: "Histórico odontológico",
    sangramentoPosProcedimento: "Sangramento pós-procedimento",
    respiracao: "Respiração",
    peso: "Peso",
    profissional: "Profissional",
    dataProcedimento: "Data do procedimento",
    modalidadePagamento: "Modalidade de pagamento",
    valor: "Valor"
  };

  return React.createElement(
    "div",
    { className: `container ${darkMode ? 'dark-mode' : ''}` },
    React.createElement(
      "div",
      { className: "theme-toggle" },
      React.createElement(
        "button",
        { onClick: toggleDarkMode, className: "theme-btn" },
        darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'
      )
    ),
    React.createElement("h1", null, "Cadastro de Usuário"),
    React.createElement(
      "form",
      { onSubmit: handleSubmit, encType: "multipart/form-data" },
      React.createElement(
        "div",
        { className: "form-section" },
        React.createElement("h2", null, "Dados Pessoais"),
        React.createElement(
          "div",
          { className: "form-grid" },
          ['nomeCompleto', 'email', 'cpf', 'telefone', 'endereco', 'dataNascimento', 'password', 'confirmPassword'].map((key) =>
            React.createElement(
              "div",
              { key: key, className: "form-group" },
              React.createElement("label", { htmlFor: key }, labels[key]),
              React.createElement("input", {
                type: key.includes("password")
                  ? "password"
                  : key === "dataNascimento"
                  ? "date"
                  : "text",
                id: key,
                name: key,
                value: formData[key],
                onChange: handleChange,
                required: true
              })
            )
          )
        )
      ),
      React.createElement(
        "div",
        { className: "form-section" },
        React.createElement("h2", null, "Histórico de Saúde"),
        React.createElement(
          "div",
          { className: "form-grid" },
          ['detalhesDoencas', 'quaisRemedios', 'quaisAnestesias', 'frequenciaFumo', 
           'frequenciaAlcool', 'historicoCirurgia', 'exameSangue', 'coagulacao', 
           'cicatrizacao', 'historicoOdontologico', 'sangramentoPosProcedimento', 
           'respiracao', 'peso'].map((key) =>
            React.createElement(
              "div",
              { key: key, className: "form-group" },
              React.createElement("label", { htmlFor: key }, labels[key]),
              React.createElement("input", {
                type: "text",
                id: key,
                name: key,
                value: formData[key],
                onChange: handleChange
              })
            )
          )
        )
      ),
      React.createElement(
        "div",
        { className: "form-section" },
        React.createElement("h2", null, "Dados do Procedimento"),
        React.createElement(
          "div",
          { className: "form-grid" },
          ['profissional', 'dataProcedimento', 'modalidadePagamento', 'valor'].map((key) =>
            React.createElement(
              "div",
              { key: key, className: "form-group" },
              React.createElement("label", { htmlFor: key }, labels[key]),
              React.createElement("input", {
                type: key === "dataProcedimento" ? "date" : "text",
                id: key,
                name: key,
                value: formData[key],
                onChange: handleChange
              })
            )
          )
        )
      ),
      React.createElement(
        "div",
        { className: "form-section" },
        React.createElement("h2", null, "Upload de Imagem"),
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement("label", { htmlFor: "image" }, "Imagem"),
          React.createElement("input", {
            type: "file",
            id: "image",
            name: "image",
            accept: ".png, .jpg, .jpeg",
            onChange: handleFileChange
          })
        )
      ),
      React.createElement(
        "button",
        { type: "submit", className: "btn" },
        React.createElement(
          "span",
          { className: "btnText" },
          editandoId ? "Atualizar" : "Cadastrar"
        ),
        React.createElement("i", { className: "bi bi-cloud-upload" })
      )
    ),
    React.createElement("h2", null, "Usuários Cadastrados"),
    React.createElement(
      "div",
      { className: "table-container" },
      React.createElement(
        "table",
        null,
        React.createElement(
          "thead",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement("th", null, "Nome"),
            React.createElement("th", null, "CPF"),
            React.createElement("th", null, "Telefone"),
            React.createElement("th", null, "Imagem"),
            React.createElement("th", null, "Ações")
          )
        ),
        React.createElement(
          "tbody",
          null,
          usuarios.map((usuario) =>
            React.createElement(
              "tr",
              { key: usuario._id },
              React.createElement("td", null, usuario.nomeCompleto),
              React.createElement("td", null, usuario.cpf),
              React.createElement("td", null, usuario.telefone),
              React.createElement(
                "td",
                null,
                usuario.image &&
                  React.createElement(
                    "button",
                    {
                      onClick: () => handleViewImage(usuario.image),
                      className: "btn-view"
                    },
                    "Imagem"
                  )
              ),
              React.createElement(
                "td",
                null,
                React.createElement(
                  "div",
                  { className: "actions" },
                  React.createElement(
                    "button",
                    {
                      onClick: () => handleEdit(usuario),
                      className: "btn-edit"
                    },
                    React.createElement(
                      "span",
                      { className: "btnText" },
                      "Editar"
                    ),
                    React.createElement("i", { className: "bi bi-pencil" })
                  ),
                  React.createElement(
                    "button",
                    {
                      onClick: () => handleDelete(usuario._id),
                      className: "btn-delete"
                    },
                    React.createElement(
                      "span",
                      { className: "btnText" },
                      "Excluir"
                    ),
                    React.createElement("i", { className: "bi bi-trash" })
                  )
                )
              )
            )
          )
        )
      )
    ),
    imagemModal &&
      React.createElement(
        "div",
        { className: "modal" },
        React.createElement(
          "div",
          { className: "modal-content" },
          React.createElement(
            "span",
            { className: "close", onClick: closeModal },
            "×"
          ),
          React.createElement("img", {
            src: `${api.defaults.baseURL}/uploads/${imagemModal}`,
            alt: "Imagem do usuário"
          })
        )
      )
  );
};

export default RegisterUser;
