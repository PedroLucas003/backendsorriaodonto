import React, { useState, useEffect } from "react";
import api from "./api/api";
import "./RegisterUser.css";

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    idade: "",
    password: "",
    confirmPassword: "",
    fone: "",
    rg: "",
    sexo: "",
    cpf: "",
    endereco: "",
    possuiAlgumaDoencaAtualmente: "",
    tratamentoMedico: "",
    medicacaoAtualmente: "",
    alergiaRemedio: "",
    historicoDoenca: "",
    condicoesHemograma: "",
    historicoProcedimentoOdontologico: "",
    procedimento: "",
    denteface: "",
    valor: "",
    modalidade: "",
    profissional: "",
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
      const response = await api.get("/auth/users");
      setUsuarios(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  const formatCPF = (value) => {
    const cleanedValue = value.replace(/\D/g, "");
    let formattedValue = cleanedValue.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      "$1.$2.$3-$4"
    );
    if (cleanedValue.length <= 3) {
      formattedValue = cleanedValue;
    } else if (cleanedValue.length <= 6) {
      formattedValue = `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3)}`;
    } else if (cleanedValue.length <= 9) {
      formattedValue = `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(
        3,
        6
      )}.${cleanedValue.slice(6)}`;
    } else if (cleanedValue.length <= 11) {
      formattedValue = `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(
        3,
        6
      )}.${cleanedValue.slice(6, 9)}-${cleanedValue.slice(9)}`;
    }
    return formattedValue;
  };

  const formatFone = (value) => {
    const cleanedValue = value.replace(/\D/g, "");
    let formattedValue = cleanedValue.replace(
      /^(\d{2})(\d{5})(\d{4})$/,
      "($1) $2-$3"
    );
    if (cleanedValue.length <= 2) {
      formattedValue = cleanedValue;
    } else if (cleanedValue.length <= 7) {
      formattedValue = `(${cleanedValue.slice(0, 2)}) ${cleanedValue.slice(2)}`;
    } else if (cleanedValue.length <= 11) {
      formattedValue = `(${cleanedValue.slice(0, 2)}) ${cleanedValue.slice(
        2,
        7
      )}-${cleanedValue.slice(7)}`;
    }
    return formattedValue;
  };

  const formatRG = (value) => {
    const cleanedValue = value.replace(/\D/g, "");
    let formattedValue = cleanedValue.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{1})$/,
      "$1.$2.$3-$4"
    );
    if (cleanedValue.length <= 2) {
      formattedValue = cleanedValue;
    } else if (cleanedValue.length <= 5) {
      formattedValue = `${cleanedValue.slice(0, 2)}.${cleanedValue.slice(2)}`;
    } else if (cleanedValue.length <= 8) {
      formattedValue = `${cleanedValue.slice(0, 2)}.${cleanedValue.slice(
        2,
        5
      )}.${cleanedValue.slice(5)}`;
    } else if (cleanedValue.length <= 9) {
      formattedValue = `${cleanedValue.slice(0, 2)}.${cleanedValue.slice(
        2,
        5
      )}.${cleanedValue.slice(5, 8)}-${cleanedValue.slice(8)}`;
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
    } else if (name === "fone") {
      formattedValue = formatFone(cleanedValue);
    } else if (name === "rg") {
      formattedValue = formatRG(cleanedValue);
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
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      let value = formData[key];
      if (key === "cpf" || key === "fone" || key === "rg") {
        value = value.replace(/\D/g, "");
      } else if (key === "valor") {
        value = value.replace(/[^0-9]/g, "");
      }
      formDataToSend.append(key, value);
    });

    try {
      if (editandoId) {
        await api.put(`/auth/users/${editandoId}`, formDataToSend);
        alert("Usuário atualizado com sucesso!");
      } else {
        await api.post("/auth/register/user", formDataToSend);
        alert("Usuário cadastrado com sucesso!");
      }
      setFormData({
        nome: "",
        email: "",
        idade: "",
        password: "",
        confirmPassword: "",
        fone: "",
        rg: "",
        sexo: "",
        cpf: "",
        endereco: "",
        possuiAlgumaDoencaAtualmente: "",
        tratamentoMedico: "",
        medicacaoAtualmente: "",
        alergiaRemedio: "",
        historicoDoenca: "",
        condicoesHemograma: "",
        historicoProcedimentoOdontologico: "",
        procedimento: "",
        denteface: "",
        valor: "",
        modalidade: "",
        profissional: "",
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
    setFormData(usuario);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await api.delete(`/auth/users/${id}`);
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

  return (
    <div className="container">
      <h1>Cadastro de Usuário</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-grid">
          {Object.keys(formData).map((key) =>
            key !== "image" ? (
              <div key={key} className="form-group">
                <label htmlFor={key}>{key}</label>
                <input
                  type={key.includes("password") ? "password" : "text"}
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                />
              </div>
            ) : (
              <div key={key} className="form-group">
                <label htmlFor={key}>Upload de Imagem</label>
                <input
                  type="file"
                  id={key}
                  name={key}
                  accept=".png, .jpg, .jpeg"
                  onChange={handleFileChange}
                />
              </div>
            )
          )}
          <button type="submit" className="btn">
            <span className="btnText">{editandoId ? "Atualizar" : "Cadastrar"}</span>
            <i className="bi bi-cloud-upload"></i>
          </button>
        </div>
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
                <td>{usuario.nome}</td>
                <td>{usuario.cpf}</td>
                <td>{usuario.fone}</td>
                <td>
                  {usuario.image && (
                    <button onClick={() => handleViewImage(usuario.image)} className="btn-view">
                       Imagem
                    </button>
                  )}
                </td>
                <td>
                  <div className="actions">
                    <button onClick={() => handleEdit(usuario)} className="btn-edit">
                      <span className="btnText">Editar</span>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button onClick={() => handleDelete(usuario._id)} className="btn-delete">
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
            <span className="close" onClick={closeModal}>&times;</span>
            <img src={`${api.defaults.baseURL}/uploads/${imagemModal}`} alt="Imagem do usuário" />
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterUser;