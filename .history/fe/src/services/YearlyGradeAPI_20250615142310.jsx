import axios from "./axiosClient";

const YearlyGradeAPI = {
  // Tính & lưu điểm TB năm
  calculate: (student_id, year) =>
    axios.post("/yearly-grades/calculate", { student_id, year }),

  // Lấy điểm TB năm đã lưu
  get: (student_id, year) =>
    axios.get("/yearly-grades", { params: { student_id, year } }),
};

export default YearlyGradeAPI;
