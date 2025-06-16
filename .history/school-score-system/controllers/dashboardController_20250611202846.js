const pool = require("../db");

exports.getHomeroomClass = async (req, res) => {
  const teacherId = req.user.id;

  try {
    const result = await pool.query(`
      SELECT 
        c.id AS class_id,         -- ✅ THÊM DÒNG NÀY
        c.name AS class_name, 
        COUNT(s.id) AS student_count
      FROM class_homeroom_teachers cht
      JOIN classes c ON c.id = cht.class_id
      LEFT JOIN students s ON s.class_id = c.id
      WHERE cht.teacher_id = $1
      GROUP BY c.id, c.name
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


exports.getSubjectClasses = async (req, res) => {
  const teacherId = req.user.id;

  try {
    const result = await pool.query(`
      SELECT 
        c.name AS class_name,
        sb.name AS subject_name,
        COUNT(s.id) AS student_count
      FROM subject_teachers st
      JOIN classes c ON c.id = st.class_id
      JOIN subjects sb ON sb.id = st.subject_id
      LEFT JOIN students s ON s.class_id = c.id
      WHERE st.teacher_id = $1
      GROUP BY c.name, sb.name
    `, [teacherId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách lớp bộ môn" });
  }
};
