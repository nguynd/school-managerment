import axios from "axios";

// Lấy lớp mà giáo viên đang chủ nhiệm
export const getHomeroomClass = async () => {
  const res = await axios.get("/api/homeroom/class");
  return res.data;
};

// Lấy danh sách lớp + môn giáo viên đang dạy
export const getSubjectClasses = async () => {
  const res = await axios.get("/api/teacher/classes");
  return res.data;
};
