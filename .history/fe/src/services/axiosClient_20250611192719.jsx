import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000", // ✅ đổi đúng backend thật
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJpYXQiOjE3NDk2NDQ4MjAsImV4cCI6MTc0OTY1MjAyMH0.zjFHGb6OXvxE4k-ci5EE0io3gntbM5w8M2HHYvZq5iY`,
  },
});

export default axiosClient;
