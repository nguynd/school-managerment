import axiosClient from "./axiosClient";

// Lấy lớp mà giáo viên đang chủ nhiệm
// Lấy lớp mà giáo viên đang chủ nhiệm
export const getHomeroomClass = async () => {
  const res = await axiosClient.get("/api/homeroom/class");
  console.log("🧪 API trả về:", res.data); // 👈 THÊM DÒNG NÀY
  const data = res.data;

  return {
    class_id: data.id,            // 👈 đổi tên từ id → class_id
    class_name: data.name,        // 👈 hoặc data.class_name nếu backend trả vậy
    student_count: data.student_count ?? 0, // fallback nếu thiếu
  };
};


// Lấy danh sách lớp + môn giáo viên đang dạy
export const getSubjectClasses = async () => {
  const res = await axiosClient.get("/api/teacher/classes");
  return Array.isArray(res.data) ? res.data : [];
};

// Lấy toàn bộ điểm của giáo viên bộ môn
export const getAllSubjectScores = async () => {
  const res = await axiosClient.get("/api/scores/teacher");
  return res.data;
};

// ✅ Thêm điểm mới (gửi đầy đủ 5 cột)
export const addScore = async (payload) => {
  const res = await axiosClient.post("/api/scores", {
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

// ✅ Cập nhật điểm (cập nhật cả 5 cột nếu cần)
export const updateScore = async (scoreId, updatedPayload) => {
  const res = await axiosClient.put(`/api/scores/${scoreId}`, {
    tx1: updatedPayload.tx1,
    tx2: updatedPayload.tx2,
    tx3: updatedPayload.tx3,
    gk: updatedPayload.gk,
    ck: updatedPayload.ck,
  });
  return res.data;
};

// (Tuỳ chọn) Xoá điểm
export const deleteScore = async (scoreId) => {
  const res = await axiosClient.delete(`/api/scores/${scoreId}`);
  return res.data;
};

// ✅ Lấy thông tin 1 môn học (dùng để lấy weight nếu cần)
export const getSubjectById = async (id) => {
  const res = await axiosClient.get(`/api/subjects/${id}`);
  return res.data;
};
  
