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
// ✅ Thêm điểm mới (dùng label)
export const addScore = async (payload) => {
  const res = await axiosClient.post("/api/scores", {
    student_id: payload.student_id,
    subject_id: payload.subject_id,
    semester: payload.semester,
    year: payload.year,
    label: payload.label, // ✅ đúng với DB
    score: payload.score,
  });
  return res.data;
};

// ✅ Cập nhật điểm
export const updateScore = async (scoreId, newScore) => {
  const res = await axiosClient.put(`/api/scores/${scoreId}`, {
    score: newScore,
  });
  return res.data;
};

// ✅ (Nếu dùng) Xoá điểm
export const deleteScore = async (scoreId) => {
  const res = await axiosClient.delete(`/api/scores/${scoreId}`);
  return res.data;
};
