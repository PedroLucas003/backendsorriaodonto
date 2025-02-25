import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterUser from "./RegisterUser";
import Login from "./Login";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} /> {/* Corrigindo a rota do login */}
        <Route path="/register" element={<RegisterUser />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
