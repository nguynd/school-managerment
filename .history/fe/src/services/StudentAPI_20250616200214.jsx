// services/StudentAPI.jsx
import axios from "./axiosClient";

// API lấy điểm cá nhân của học sinh
export const getMyScores = async (semester, year) => {
  const params = {};
  if (semester) params.semester = semester;
  if (year) params.year = year;

  const res = await axios.get("/my-scores", { params });
  return Array.isArray(res.data) ? res.data : [];
};
