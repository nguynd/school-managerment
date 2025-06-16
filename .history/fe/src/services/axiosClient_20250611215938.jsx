import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000", // ✅ đổi đúng backend thật
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJpYXQiOjE3NDk2NTM5NjQsImV4cCI6MTc0OTY2MTE2NH0.Fy_Bh_9Yzmo-yY58_UDS96nMXy0byrcAv729wDb3iRI`,
  },
});

export default axiosClient;
