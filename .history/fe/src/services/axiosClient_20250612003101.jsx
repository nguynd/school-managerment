import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000", // ✅ đổi đúng backend thật
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJpYXQiOjE3NDk2NjMwNDcsImV4cCI6MTc0OTY3MDI0N30.uFbj9aRtHUJavWmDX-Pew7CDMmkmTpn__d41sgGE_gA`,
  },
});

export default axiosClient;
