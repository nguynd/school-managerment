import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:3000", // ✅ đổi đúng backend thật
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export default axiosClient;
