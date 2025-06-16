import axiosClient from "./axiosClient";

// Lấy lớp mà giáo viên đang chủ nhiệm
export const getHomeroomClass = async () => {
  const res = await axiosClient.get("/api/homeroom/class");
  return res.data;
};

// Lấy danh sách lớp + môn giáo viên đang dạy
export const getSubjectClasses = async () => {
  const res = await axiosClient.get("/api/teacher/classes");
  return Array.isArray(res.data) ? res.data : [];
};

// Lấy toàn bộ điểm của giáo viên bộ môn
export const getAllSubjectScores = async () => {
  const res = await axiosClient.get("api/scores/teacher");
  return res.data;
};
