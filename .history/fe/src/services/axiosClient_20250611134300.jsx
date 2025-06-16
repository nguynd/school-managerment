import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000", // ✅ đổi đúng backend thật
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJpYXQiOjE3NDk2MjQwOTcsImV4cCI6MTc0OTYzMTI5N30.RZnjSEYk_5ugmgbhVEt2znZ45olraq2tSz1dnxOCIwQ`,
  },
});

export default axiosClient;
