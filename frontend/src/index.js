import React from 'react';
import ReactDOM from 'react-dom/client'; // Importação correta para React 18
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './components/MainPage/MainPage';
import RegisterUser from './RegisterUser';
import Login from './Login';
import Prontuario from './Prontuario';
import './index.css'; // Adicione este import para estilos globais

// Função de Rota Protegida
const ProtectedRoute = ({ element, ...rest }) => {
  const isAuthenticated = !!localStorage.getItem("token"); // Verifica o token no localStorage

  // Se estiver autenticado, renderiza o componente; caso contrário, redireciona para o login
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<ProtectedRoute element={<RegisterUser />} />} />
        <Route path="/prontuario" element={<ProtectedRoute element={<Prontuario />} />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
