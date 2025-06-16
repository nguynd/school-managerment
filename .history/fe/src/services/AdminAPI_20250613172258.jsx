import axiosClient from "./axiosClient";

const AdminAPI = {
  // 📘 -------- LỚP HỌC --------
  getAllClasses: async () => {
    try {
      const res = await axiosClient.get("/classes");
      return res.data;
    } catch (err) {
      console.error("Lỗi khi lấy danh sách lớp:", err);
      return [];
    }
  },

  getClassById: async (id) => {
    try {
      const res = await axiosClient.get(`/classes/${id}`);
      return res.data;
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết lớp:", err);
      return null;
    }
  },

  createClass: async (payload) => {
    return axiosClient.post("/classes", payload);
  },

  updateClass: async (id, payload) => {
    return axiosClient.put(`/classes/${id}`, payload);
  },

  deleteClass: async (id) => {
    return axiosClient.delete(`/classes/${id}`);
  },

  // 🧑‍🎓 -------- HỌC SINH --------
  getStudentsByClass: async (classId) => {
    try {
      const res = await axiosClient.get(`/classes/${classId}/students`);
      return res.data;
    } catch (err) {
      console.error("Lỗi khi lấy học sinh của lớp:", err);
      return [];
    }
  },

  createStudent: async (payload) => {
    return axiosClient.post("/students", payload);
  },

  updateStudent: async (id, payload) => {
    return axiosClient.put(`/students/${id}`, payload);
  },

  deleteStudent: async (id) => {
    return axiosClient.delete(`/students/${id}`);
  },
};

export default AdminAPI;
