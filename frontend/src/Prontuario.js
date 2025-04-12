import React, { useState } from "react";
import api from "./api/api"; // <-- usando sua instância com interceptors
import styles from "./Prontuario.module.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Prontuario() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  const formatarCPF = (valor) => {
    return valor
      .replace(/\D/g, "") // remove tudo que não for dígito
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cpf || !senha) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const cleanedCPF = cpf.replace(/\D/g, ""); // remove pontos e traços

      const response = await api.post("/auth/prontuario", {
        cpf: cleanedCPF,
        password: senha,
      });

      setError("");
      setEnviado(true);
      gerarPDF(response.data);
    } catch (err) {
      setEnviado(false);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Erro ao buscar prontuário.");
      }
    }
  };

  const gerarPDF = (dados) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Clínica Sorria Odonto", 105, 15, { align: "center" });

    doc.setFontSize(14);
    doc.text("Prontuário do Paciente", 105, 25, { align: "center" });

    const secoes = {
      "Dados Pessoais": [
        "nomeCompleto", "email", "cpf", "telefone", "endereco", "dataNascimento"
      ],
      "Saúde": [
        "detalhesDoencas", "quaisRemedios", "quaisAnestesias", "frequenciaFumo", "frequenciaAlcool"
      ],
      "Informações Médicas": [
        "historicoCirurgia", "exameSangue", "coagulacao", "cicatrizacao", "historicoOdontologico",
        "sangramentoPosProcedimento", "respiracao", "peso"
      ],
      "Procedimento": [
        "profissional", "dataProcedimento", "modalidadePagamento", "valor"
      ]
    };

    let y = 35;

    for (const secao in secoes) {
      const campos = secoes[secao];
      const linhas = [];

      campos.forEach((campo) => {
        if (campo === "password" || campo === "image") return;
        let valor = dados[campo];

        if (campo === "cpf" && valor) {
          valor = formatarCPF(valor);
        }

        if (campo.toLowerCase().includes("data") && valor) {
          valor = new Date(valor).toLocaleDateString("pt-BR");
        }

        linhas.push([formatarCampo(campo), valor || "-"]);
      });

      if (linhas.length > 0) {
        doc.setFontSize(12);
        doc.text(secao, 14, y);
        autoTable(doc, {
          startY: y + 2,
          head: [["Campo", "Valor"]],
          body: linhas,
          theme: "grid",
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 },
        });
        y = doc.lastAutoTable.finalY + 10;
      }
    }

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  const formatarCampo = (campo) => {
    return campo
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className={styles.prontuarioContainer}>
      <div className={styles.prontuarioBox}>
        <h2>Consultar Prontuário</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(formatarCPF(e.target.value))}
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button type="submit" className={styles.btnDownload}>
            <span className={styles.btnText}>Prontuário</span>
            <i className="fas fa-paper-plane" />
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}
        {enviado && <div className={styles.prontuario}></div>}
      </div>
    </div>
  );
}

export default Prontuario;