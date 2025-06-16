import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000", // ✅ đổi đúng backend thật
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InRlYWNoZXIiLCJpYXQiOjE3NDk2MjI3OTAsImV4cCI6MTc0OTYyOTk5MH0.t_khHGr3Sn8Wx-YARfSruyjlI1tItsekJH0K7XS-cck`,
  },
});

export default axiosClient;
