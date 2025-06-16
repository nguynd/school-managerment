const pool = require("../db");

exports.getAllClasses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT classes.id, classes.name, users.name AS teacher_name
      FROM classes
      LEFT JOIN users ON classes.teacher_id = users.id
      ORDER BY classes.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách lớp" });
  }
};

exports.createClass = async (req, res) => {
  const { name, teacher_id } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO classes (name, teacher_id) VALUES ($1, $2) RETURNING *",
      [name, teacher_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi tạo lớp học" });
  }
};

exports.updateClass = async (req, res) => {
  const { name, teacher_id } = req.body;
  const id = req.params.id;
  try {
    const result = await pool.query(
      "UPDATE classes SET name = $1, teacher_id = $2 WHERE id = $3 RETURNING *",
      [name, teacher_id, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi cập nhật lớp học" });
  }
};

exports.deleteClass = async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM classes WHERE id = $1", [id]);
    res.json({ message: "Đã xoá lớp học" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi xoá lớp học" });
  }
};
