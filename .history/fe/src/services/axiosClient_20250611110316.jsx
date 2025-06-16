import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000", // ✅ đổi đúng backend thật
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJpYXQiOjE3NDk2MTQ1NzcsImV4cCI6MTc0OTYyMTc3N30.Qcj3wRvQsBppC_dQieXE0jwmFXGQ3Y3unuMQyC9f0r8`,
  },
});

export default axiosClient;
