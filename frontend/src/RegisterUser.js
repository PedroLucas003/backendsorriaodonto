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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prevData) => ({ ...prevData, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => formDataToSend.append(key, formData[key]));

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
          <button type="submit" className="btn">{editandoId ? "Atualizar" : "Cadastrar"}</button>
        </div>
      </form>

      <h2>Usuários Cadastrados</h2>
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
                <button onClick={() => handleEdit(usuario)} className="btn-edit">Editar</button>
                <button onClick={() => handleDelete(usuario._id)} className="btn-delete">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RegisterUser;
