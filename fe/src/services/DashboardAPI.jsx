import axiosClient from "./axiosClient";

// ✅ Lấy lớp mà giáo viên đang chủ nhiệm
export const getHomeroomClass = async () => {
  const res = await axiosClient.get("/homeroom/class");
  const raw = res.data;

  if (!raw) return null;

  return {
    class_id: raw.class_id ?? raw.id, // fallback nếu backend chưa đổi key
    class_name: raw.class_name ?? raw.name,
    student_count: Number(raw.student_count) || 0,
  };
};

// ✅ Lấy danh sách lớp + môn giáo viên đang dạy
export const getSubjectClasses = async () => {
  const res = await axiosClient.get("/teacher/classes");
  return Array.isArray(res.data) ? res.data : [];
};

// ✅ Lấy toàn bộ điểm của giáo viên bộ môn
export const getAllSubjectScores = async () => {
  const res = await axiosClient.get("/scores/teacher");
  return res.data;
};

// ✅ Thêm điểm mới
export const addScore = async (payload) => {
  const res = await axiosClient.post("/scores", {
    student_id: payload.student_id,
    subject_id: payload.subject_id,
    semester: payload.semester,
    year: payload.year,
    tx1: payload.tx1,
    tx2: payload.tx2,
    tx3: payload.tx3,
    gk: payload.gk,
    ck: payload.ck,
  });
  return res.data;
};

// ✅ Cập nhật điểm
export const updateScore = async (scoreId, updatedPayload) => {
  const res = await axiosClient.put(`/scores/${scoreId}`, {
    tx1: updatedPayload.tx1,
    tx2: updatedPayload.tx2,
    tx3: updatedPayload.tx3,
    gk: updatedPayload.gk,
    ck: updatedPayload.ck,
  });
  return res.data;
};

// ✅ Xoá điểm
export const deleteScore = async (scoreId) => {
  const res = await axiosClient.delete(`/scores/${scoreId}`);
  return res.data;
};

// ✅ Lấy thông tin 1 môn học (để lấy trọng số)
export const getSubjectById = async (id) => {
  const res = await axiosClient.get(`/subjects/${id}`);
  return res.data;
};
