import React, { useState, useEffect } from "react";
import axios from "axios";
import "./RegisterUser.css"; // Importação do CSS

const API_URL = "http://localhost:3000/auth/register/user";
const API_URL_LIST = "http://localhost:3000/auth/users"; // Endpoint para listar usuários

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

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get(API_URL_LIST);
      setUsuarios(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  // Função para formatar CPF
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

  // Função para formatar Telefone
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

  // Função para formatar RG
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

  // Função para formatar Valor
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
    let cleanedValue = value.replace(/\D/g, ""); // Remove não números

    // Aplica a máscara correspondente ao campo
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
      // Remove máscara antes de enviar
      if (key === "cpf" || key === "fone" || key === "rg") {
        value = value.replace(/\D/g, "");
      } else if (key === "valor") {
        value = value.replace(/[^0-9]/g, ""); // Remove tudo que não é número
      }
      formDataToSend.append(key, value);
    });

    try {
      if (editandoId) {
        await axios.put(`${API_URL}/${editandoId}`, formDataToSend);
        alert("Usuário atualizado com sucesso!");
      } else {
        await axios.post(API_URL, formDataToSend);
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
        await axios.delete(`${API_URL}/${id}`);
        alert("Usuário excluído com sucesso!");
        fetchUsuarios();
      } catch (error) {
        alert("Erro ao excluir usuário.");
      }
    }
  };

  return (
    <div className="container">
      <h1>Cadastro de Usuário</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-grid">
          {Object.keys(formData).map((key) => (
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
                <input type="file" id={key} name={key} accept=".png, .jpg, .jpeg" onChange={handleFileChange} />
              </div>
            )
          ))}
          <button type="submit" className="btn">
            <span className="btnText">{editandoId ? "Atualizar" : "Cadastrar"}</span>
            <i className="bi bi-cloud-upload"></i> {/* Ícone de upload */}
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
                  <div className="actions">
                    <button onClick={() => handleEdit(usuario)} className="btn-edit">
                      <span className="btnText">Editar</span>
                      <i className="bi bi-pencil"></i> {/* Ícone de edição */}
                    </button>
                    <button onClick={() => handleDelete(usuario._id)} className="btn-delete">
                      <span className="btnText">Excluir</span>
                      <i className="bi bi-trash"></i> {/* Ícone de exclusão */}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegisterUser;