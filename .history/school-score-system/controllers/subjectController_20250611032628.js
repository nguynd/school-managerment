const pool = require("../db");

exports.getSubjects = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM subjects ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi lấy danh sách môn học" });
  }
};

exports.createSubject = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO subjects (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi tạo môn học (có thể bị trùng tên)" });
  }
};

exports.updateSubject = async (req, res) => {
  const { name } = req.body;
  const id = req.params.id;
  try {
    const result = await pool.query(
      "UPDATE subjects SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi cập nhật môn học" });
  }
};

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
