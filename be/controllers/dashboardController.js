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
        c.id         AS class_id,      -- ✅ trả về ID lớp
        c.name       AS class_name,
        s.id         AS subject_id,    -- ✅ trả về ID môn
        s.name       AS subject_name,
        COUNT(stu.id) AS student_count
      FROM subject_teachers st
      JOIN classes  c   ON c.id = st.class_id
      JOIN subjects s   ON s.id = st.subject_id
      LEFT JOIN students stu ON stu.class_id = c.id
      WHERE st.teacher_id = $1
      GROUP BY c.id, c.name, s.id, s.name
      ORDER BY c.id;
    `, [teacherId]);

    res.json(result.rows);
  } catch (err) {
    console.error("getSubjectClasses:", err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách lớp bộ môn" });
  }
};
