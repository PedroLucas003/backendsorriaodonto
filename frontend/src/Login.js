import React, { useState } from "react";
import api from "./api/api";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

const Login = () => {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Função para formatar o CPF (mantida igual)
  const formatCPF = (value) => {
    const cleanedValue = value.replace(/\D/g, "");
    if (cleanedValue.length <= 3) return cleanedValue;
    if (cleanedValue.length <= 6) return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3)}`;
    if (cleanedValue.length <= 9) return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3, 6)}.${cleanedValue.slice(6)}`;
    return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3, 6)}.${cleanedValue.slice(6, 9)}-${cleanedValue.slice(9, 11)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanedCPF = cpf.replace(/\D/g, "");

      const response = await api.post("/auth/login", {
        cpf: cleanedCPF,
        password,
      });

      const token = response.data.token;
      // Substitua por:
      localStorage.setItem("token", token, { secure: true, sameSite: 'strict' });

      navigate("/register");
    } catch (error) {
      // Tratamento modificado para acesso não autorizado
      if (error.response?.status === 403) {
        setError("Acesso restrito. Seu CPF não está autorizado.");
      } else {
        setError(
          error.response?.data?.message ||
          "Erro ao fazer login! Verifique os dados e tente novamente."
        );
      }
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
            value={formatCPF(cpf)}
            onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))}
            maxLength={14}
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
            <i className="bi bi-box-arrow-in-right"></i>
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default Login;