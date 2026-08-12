import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:5000/api", // Changed https to http for standard local express
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;