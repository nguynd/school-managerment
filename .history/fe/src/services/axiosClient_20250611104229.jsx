import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000", // ✅ đổi đúng backend thật
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJpYXQiOjE3NDk2MTMzMjcsImV4cCI6MTc0OTYyMDUyN30.4zODhrxxw1J27uBvsSUr2PNo7TcjAQjZuFtESac6rgw`,
  },
});

export default axiosClient;
