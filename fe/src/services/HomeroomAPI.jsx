import axiosClient from "./axiosClient";

const HomeroomAPI = {
  // ✅ Lấy học sinh kèm ĐTB + xếp loại
  getStudentsWithGrading: async (classId, semester, year) => {
    const res = await axiosClient.get(
      `/students/class/${classId}/students-with-grading`,
      { params: { semester, year } }
    );
    return res.data;
  },

  // ✅ Lấy điểm trung bình toàn lớp
  getClassAverageScore: async (classId, semester, year) => {
    const res = await axiosClient.get(`/classes/${classId}/average`, {
      params: { semester, year },
    });
    return res.data; // { avg, classification }
  },

  // ✅ Tạo học sinh mới
  createStudent: async (data) => {
    const res = await axiosClient.post("/students", data);
    return res.data;
  },

  // ✅ Cập nhật thông tin học sinh
  updateStudent: async (id, data) => {
    const res = await axiosClient.put(`/students/${id}`, data);
    return res.data;
  },

  // ✅ Xoá học sinh
  deleteStudent: async (id) => {
    const res = await axiosClient.delete(`/students/${id}`);
    return res.data;
  },
};

export default HomeroomAPI;
