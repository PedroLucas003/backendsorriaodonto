import React, { useState } from "react";
import axios from "axios";
import styles from "./Prontuario.module.css"; // Importando CSS Module

const Prontuario = () => {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [patientName, setPatientName] = useState(""); // Estado para armazenar o nome do paciente
  const [error, setError] = useState("");
  const [downloaded, setDownloaded] = useState(false); // Estado para controlar se o prontuário foi baixado
  const [prontuarioData, setProntuarioData] = useState(null); // Estado para armazenar os dados do prontuário

  // Função para formatar o CPF
  const formatCPF = (value) => {
    // Remove tudo que não é número
    const cleanedValue = value.replace(/\D/g, "");

    // Aplica a máscara: XXX.XXX.XXX-XX
    let formattedValue = cleanedValue.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      "$1.$2.$3-$4"
    );

    // Se o CPF não estiver completo, aplica a máscara parcial
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

  const handleLogin = async () => {
    try {
      // Remove a máscara antes de enviar o CPF
      const cleanedCPF = cpf.replace(/\D/g, "");
      const response = await axios.post("http://localhost:3000/auth/prontuario", { cpf: cleanedCPF, password });
      setPatientName(response.data.nome); // Armazena apenas o nome do paciente
      setProntuarioData(response.data); // Armazena os dados do prontuário para o download
      setError("");
      setDownloaded(false); // Reseta o estado de download
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao buscar prontuário.");
      setPatientName(""); // Limpa o nome do paciente em caso de erro
      setProntuarioData(null); // Limpa os dados do prontuário
    }
  };

  const handleDownload = () => {
    if (!prontuarioData) return;

    const prontuarioTexto = `
      --- PRONTUÁRIO MÉDICO ---
      Nome: ${prontuarioData.nome}
      Email: ${prontuarioData.email}
      Idade: ${prontuarioData.idade}
      Telefone: ${prontuarioData.telefone}
      Endereço: ${prontuarioData.endereco}
      Histórico de Doenças: ${prontuarioData.historicoDoenca}
      Tratamento Médico: ${prontuarioData.tratamentoMedico}
      Procedimento: ${prontuarioData.procedimento}
      Profissional Responsável: ${prontuarioData.profissional}
      ---------------------------
    `;

    const blob = new Blob([prontuarioTexto], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `prontuario_${prontuarioData.nome.replace(/\s/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Após o download, marca como baixado
    setDownloaded(true);
  };

  return (
    <div className={styles.prontuarioContainer}>
      <div className={styles.prontuarioBox}>
        <h2>Acessar Prontuário</h2>
        <input
          type="text"
          placeholder="Digite seu CPF"
          value={formatCPF(cpf)} // Aplica a máscara ao exibir o valor
          onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))} // Remove não números ao atualizar o estado
          maxLength={14} // Tamanho máximo com máscara
        />
        <input
          type="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin} className={styles.btnDownload}>
          <span className={styles.btnText}>Buscar</span>
          <i className="bi bi-cloud-download"></i>
        </button>

        {error && <p className={styles.error}>{error}</p>}

        {patientName && !downloaded && (
          <div className={styles.prontuario}>
            <h3>Prontuário de {patientName}</h3>
            <button onClick={handleDownload} className={styles.btnDownload}>
              <span className={styles.btnText}>Baixar</span>
              <i className="bi bi-download"></i>
            </button>
          </div>
        )}

        {downloaded && (
          <div className={styles.prontuario}>
            <h3>Prontuário de {patientName}</h3>
            <p>O prontuário foi baixado com sucesso!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prontuario;