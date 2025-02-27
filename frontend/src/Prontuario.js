import React, { useState } from "react";
import axios from "axios";
import "./Prontuario.css"; // Importando o CSS

const Prontuario = () => {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:3000/auth/prontuario", { cpf, password });
      setData(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao buscar prontuário.");
      setData(null);
    }
  };

  const handleDownload = () => {
    if (!data) return;
    
    const prontuarioTexto = `
      Nome: ${data.nome}
      Email: ${data.email}
      Idade: ${data.idade}
      Telefone: ${data.telefone}
      Endereço: ${data.endereco}
      Histórico de Doenças: ${data.historicoDoenca}
      Tratamento Médico: ${data.tratamentoMedico}
      Procedimento: ${data.procedimento}
      Profissional Responsável: ${data.profissional}
    `;

    const blob = new Blob([prontuarioTexto], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `prontuario_${data.nome}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2>Acessar Prontuário</h2>
      <input type="text" placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} />
      <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Buscar</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <div>
          <h3>Prontuário de {data.nome}</h3>
          <p><strong>Email:</strong> {data.email}</p>
          <p><strong>Idade:</strong> {data.idade}</p>
          <p><strong>Telefone:</strong> {data.telefone}</p>
          <p><strong>Endereço:</strong> {data.endereco}</p>
          <p><strong>Histórico de Doenças:</strong> {data.historicoDoenca}</p>
          <p><strong>Tratamento Médico:</strong> {data.tratamentoMedico}</p>
          <p><strong>Procedimento:</strong> {data.procedimento}</p>
          <p><strong>Profissional Responsável:</strong> {data.profissional}</p>
          <button onClick={handleDownload}>Baixar Prontuário</button>
        </div>
      )}
    </div>
  );
};

export default Prontuario;
