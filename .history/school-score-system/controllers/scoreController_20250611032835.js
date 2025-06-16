const pool = require("../db");

exports.getScores = async (req, res) => {
  try {
    const { student_id, semester, year } = req.query;
    const params = [];
    const filters = [];

    if (student_id) {
      filters.push("scores.student_id = $" + (params.length + 1));
      params.push(student_id);
    }
    if (semester) {
      filters.push("scores.semester = $" + (params.length + 1));
      params.push(semester);
    }
    if (year) {
      filters.push("scores.year = $" + (params.length + 1));
      params.push(year);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const result = await pool.query(
      `SELECT scores.*, students.name AS student_name, subjects.name AS subject_name
       FROM scores
       JOIN students ON scores.student_id = students.id
       JOIN subjects ON scores.subject_id = subjects.id
       ${whereClause}
       ORDER BY scores.student_id, scores.subject_id`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi lấy điểm" });
  }
};

exports.createScore = async (req, res) => {
  const { student_id, subject_id, semester, year, type, score } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO scores (student_id, subject_id, semester, year, type, score)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [student_id, subject_id, semester, year, type, score]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi tạo điểm (có thể bị trùng loại điểm)" });
  }
};

exports.updateScore = async (req, res) => {
  const id = req.params.id;
  const { score } = req.body;
  try {
    const result = await pool.query(
      `UPDATE scores SET score = $1 WHERE id = $2 RETURNING *`,
      [score, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi cập nhật điểm" });
  }
};

exports.deleteScore = async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM scores WHERE id = $1", [id]);
    res.json({ message: "Đã xoá điểm" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi xoá điểm" });
  }
};
