const pool = require("../db");

exports.getHomeroomClass = async (req, res) => {
  const teacherId = req.user.id;

  try {
    const result = await pool.query(`
      SELECT c.name AS class_name, COUNT(s.id) AS student_count
      FROM class_homeroom_teachers cht
      JOIN classes c ON c.id = cht.class_id
      LEFT JOIN students s ON s.class_id = c.id
      WHERE cht.teacher_id = $1
      GROUP BY c.name
    `, [teacherId]);

    if (result.rowCount === 0) {
      return res.status(200).json(null);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy lớp chủ nhiệm" });
  }
};
