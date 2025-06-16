import axiosClient from "./axiosClient";

const HomeroomAPI = {
  // ✅ Lấy học sinh kèm ĐTB + xếp loại
  getStudentsWithGrading: async (classId, semester, year) => {
    const res = await axiosClient.get(
      `/api/students/class/${classId}/students-with-grading`,
      { params: { semester, year } }
    );
    return res.data;
  },

  // ✅ Lấy điểm trung bình toàn lớp
  getClassAverageScore: async (classId, semester, year) => {
    const res = await axiosClient.get(`/api/classes/${classId}/average`, {
      params: { semester, year },
    });
    return res.data; // { avg, classification }
  },

  // ✅ Tạo học sinh mới
  createStudent: async (data) => {
    const res = await axiosClient.post("/api/students", data);
    return res.data;
  },

  // ✅ Cập nhật thông tin học sinh
  updateStudent: async (id, data) => {
    const res = await axiosClient.put(`/api/students/${id}`, data);
    return res.data;
  },

  // ✅ Xoá học sinh
  deleteStudent: async (id) => {
    const res = await axiosClient.delete(`/api/students/${id}`);
    return res.data;
  },
};

export default HomeroomAPI;
