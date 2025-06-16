import axiosClient from "./axiosClient";

const HomeroomAPI = {
  getStudentsInClass: async (classId) => {
    const res = await axiosClient.get(`/classes/${classId}/students`);
    return res.data;
  },

  getClassAverageScore: async (classId) => {
    const res = await axiosClient.get(`/classes/${classId}/average`);
    return res.data; // { avg: 7.5, classification: "Khá" }
  },
};

export default HomeroomAPI;
