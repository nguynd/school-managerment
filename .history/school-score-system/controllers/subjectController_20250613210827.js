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

// Lấy chi tiết 1 môn học theo ID
exports.getSubjectById = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM subjects WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy môn học" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi lấy môn học" });
  }
};

// Tạo môn học mới + sinh sẵn bản ghi scores cho mọi học sinh
exports.createSubject = async (req, res) => {
  const { name, regular_weight, mid_weight, final_weight, semester, year } = req.body;

  if (!semester || !year) {
    return res.status(400).json({ error: "Thiếu semester hoặc year" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Tạo môn học
    const subRes = await client.query(
      `INSERT INTO subjects (name, regular_weight, mid_weight, final_weight)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, regular_weight, mid_weight, final_weight],
    );
    const newSubject = subRes.rows[0];

    // 2. Tạo bản ghi scores mặc định cho tất cả học sinh
    await client.query(
      `INSERT INTO scores (student_id, subject_id, semester, year)
       SELECT id, $1, $2, $3 FROM students`,
      [newSubject.id, semester, year],
    );

    await client.query("COMMIT");
    res.status(201).json(newSubject);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Lỗi tạo môn học hoặc khởi tạo điểm" });
  } finally {
    client.release();
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
      [name, regular_weight, mid_weight, final_weight, id],
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
