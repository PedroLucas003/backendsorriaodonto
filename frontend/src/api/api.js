// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://sorriaodonto.com",
});

export default api;
