import axiosClient from "./axiosClient";

// ✅ Lấy lớp chủ nhiệm (giáo viên chủ nhiệm)
export const getHomeroomClass = async () => {
  const res = await axiosClient.get("/homeroom-class");
  return res.data;
};

// ✅ Lấy danh sách lớp bộ môn (giáo viên bộ môn)
export const getSubjectClasses = async () => {
  const res = await axiosClient.get("/subject-classes");
  return res.data;
};

// ✅ Lấy toàn bộ điểm của giáo viên bộ môn
export const getAllSubjectScores = async () => {
  const res = await axiosClient.get("/scores/teacher");
  return res.data;
};

// ✅ Thêm điểm mới (dùng label)
export const addScore = async (payload) => {
  const res = await axiosClient.post("/scores", {
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
  const res = await axiosClient.put(`/scores/${scoreId}`, {
    score: newScore,
  });
  return res.data;
};

// ✅ (Nếu dùng) Xoá điểm
export const deleteScore = async (scoreId) => {
  const res = await axiosClient.delete(`/scores/${scoreId}`);
  return res.data;
};
