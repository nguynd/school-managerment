import axiosClient from "./axiosClient";

const HomeroomAPI = {
  // Lấy danh sách học sinh trong lớp (không có điểm)
  getStudentsInClass: async (classId) => {
    const res = await axiosClient.get(`/api/classes/${classId}/students`);
    return res.data;
  },

  // Lấy điểm trung bình & xếp loại cho từng học sinh
  getStudentGrading: async (studentId, semester, year) => {
    const res = await axiosClient.get(`/api/grades/${studentId}`, {
      params: { semester, year },
    });
    return res.data; // { average, grade }
  },

  // Lấy điểm trung bình toàn lớp (nếu có)
  getClassAverageScore: async (classId) => {
    const res = await axiosClient.get(`/api/classes/${classId}/average`);
    return res.data; // { avg, classification }
  },
};

export default HomeroomAPI;
