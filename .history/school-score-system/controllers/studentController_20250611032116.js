const pool = require("../db");

exports.getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT students.id, students.name, students.date_of_birth, classes.name AS class_name
      FROM students
      LEFT JOIN classes ON students.class_id = classes.id
      ORDER BY students.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi lấy danh sách học sinh" });
  }
};

exports.createStudent = async (req, res) => {
  const { name, date_of_birth, class_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO students (name, date_of_birth, class_id) 
       VALUES ($1, $2, $3) RETURNING *`,
      [name, date_of_birth, class_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi tạo học sinh" });
  }
};

exports.updateStudent = async (req, res) => {
  const { name, date_of_birth, class_id } = req.body;
  const id = req.params.id;
  try {
    const result = await pool.query(
      `UPDATE students SET name = $1, date_of_birth = $2, class_id = $3 
       WHERE id = $4 RETURNING *`,
      [name, date_of_birth, class_id, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi cập nhật học sinh" });
  }
};

exports.deleteStudent = async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM students WHERE id = $1", [id]);
    res.json({ message: "Đã xoá học sinh" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi xoá học sinh" });
  }
};
