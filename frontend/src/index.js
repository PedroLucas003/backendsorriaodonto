import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage/MainPage';
import RegisterUser from './RegisterUser';
import Login from './Login';
import Prontuario from './Prontuario';
import './index.css'; // Adicione este import para estilos globais

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/prontuario" element={<Prontuario />} />
      </Routes>
    </Router>
  </React.StrictMode>
);