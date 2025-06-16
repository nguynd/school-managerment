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
};

export default HomeroomAPI;
    