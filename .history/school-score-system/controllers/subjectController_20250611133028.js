const pool = require("../db");

// Lấy danh sách môn học
exports.getSubjects = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM subjects ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi lấy danh sách môn học" });
  }
};

// Lấy chi tiết 1 môn học theo ID (dùng cho tính điểm trung bình)
exports.getSubjectById = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query(
      "SELECT * FROM subjects WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy môn học" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi lấy môn học" });
  }
};

// Tạo môn học mới
exports.createSubject = async (req, res) => {
  const { name, regular_weight, mid_weight, final_weight } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO subjects (name, regular_weight, mid_weight, final_weight)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, regular_weight, mid_weight, final_weight]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi tạo môn học (có thể bị trùng tên)" });
  }
};

// Cập nhật môn học
exports.updateSubject = async (req, res) => {
  const id = req.params.id;
  const { name, regular_weight, mid_weight, final_weight } = req.body;
  try {
    const result = await pool.query(
      `UPDATE subjects
       SET name = $1,
           regular_weight = $2,
           mid_weight = $3,
           final_weight = $4
       WHERE id = $5 RETURNING *`,
      [name, regular_weight, mid_weight, final_weight, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi cập nhật môn học" });
  }
};

// Xoá môn học
exports.deleteSubject = async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM subjects WHERE id = $1", [id]);
    res.json({ message: "Đã xoá môn học" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi xoá môn học (có thể đang được sử dụng)" });
  }
};
