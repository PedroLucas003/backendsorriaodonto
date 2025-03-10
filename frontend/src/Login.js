import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css"; // Importando CSS Module

const API_URL = "http://localhost:3000/auth/login";

const Login = () => {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Remove a máscara antes de enviar o CPF
      const cleanedCPF = cpf.replace(/\D/g, "");
      const response = await axios.post(API_URL, { cpf: cleanedCPF, password });
      alert(response.data.message);
      navigate("/register");
    } catch (error) {
      setError(error.response?.data?.message || "Erro ao fazer login! Verifique os dados e tente novamente.");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Digite seu CPF"
            value={formatCPF(cpf)} // Aplica a máscara ao exibir o valor
            onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))} // Remove não números ao atualizar o estado
            maxLength={14} // Tamanho máximo com máscara
            required
          />
          <input
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className={styles.btnLogin}>
            <span className={styles.btnText}>Entrar</span>
            <i className="bi bi-box-arrow-in-right"></i> {/* Ícone de login */}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default Login;