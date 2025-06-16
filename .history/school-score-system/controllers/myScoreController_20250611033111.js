const pool = require("../db");

exports.getMyScores = async (req, res) => {
  try {
    const { semester, year } = req.query;
    const userId = req.user.id;

    // Lấy student_id gắn với user_id
    const studentResult = await pool.query(
      "SELECT id FROM students WHERE user_id = $1",
      [userId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy học sinh" });
    }

    const student_id = studentResult.rows[0].id;

    // Lấy điểm từ bảng scores
    const filters = [];
    const params = [student_id];

    if (semester) {
      filters.push(`scores.semester = $${params.length + 1}`);
      params.push(semester);
    }

    if (year) {
      filters.push(`scores.year = $${params.length + 1}`);
      params.push(year);
    }

    const where = filters.length ? `AND ${filters.join(" AND ")}` : "";

    const scoreResult = await pool.query(
      `SELECT scores.*, subjects.name AS subject_name
       FROM scores
       JOIN subjects ON scores.subject_id = subjects.id
       WHERE scores.student_id = $1 ${where}
       ORDER BY year, semester, subject_id`,
      params
    );

    res.json(scoreResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy điểm cá nhân" });
  }
};
