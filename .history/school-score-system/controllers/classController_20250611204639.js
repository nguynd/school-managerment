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

exports.getClassStudents = async (req, res) => {
  const classId = req.params.id;
  try {
    const result = await pool.query(
      `SELECT id, name, date_of_birth, user_id
       FROM students
       WHERE class_id = $1
       ORDER BY name`,
      [classId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách học sinh của lớp" });
  }
};

exports.getClassAverage = async (req, res) => {
  const classId = req.params.id;
  const { semester, year } = req.query;

  if (!semester || !year) {
    return res.status(400).json({ error: "Thiếu semester hoặc year" });
  }

  try {
    const result = await pool.query(`
      SELECT s.student_id,
        (
          (
            COALESCE(s.tx1, 0) + COALESCE(s.tx2, 0) + COALESCE(s.tx3, 0)
          ) * sub.regular_weight
          + COALESCE(s.gk, 0) * sub.mid_weight
          + COALESCE(s.ck, 0) * sub.final_weight
        ) / (
          3 * sub.regular_weight + sub.mid_weight + sub.final_weight
        ) AS subject_avg
      FROM scores s
      JOIN subjects sub ON sub.id = s.subject_id
      JOIN students st ON st.id = s.student_id
      WHERE st.class_id = $1 AND s.semester = $2 AND s.year = $3
    `, [classId, semester, year]);

    const subjectAvgs = result.rows.map(r => Number(r.subject_avg));
    if (subjectAvgs.length === 0) {
      return res.json({ avg: null, classification: "Chưa có điểm" });
    }

    const classAvg = subjectAvgs.reduce((sum, val) => sum + val, 0) / subjectAvgs.length;

    // Lấy xếp loại theo điểm trung bình lớp
    const gradeResult = await pool.query(`
      SELECT name FROM grading_levels
      WHERE $1 >= min_score AND $1 < max_score
      LIMIT 1
    `, [classAvg]);

    const classification = gradeResult.rows[0]?.name || "Chưa xếp loại";

    res.json({
      avg: Number(classAvg.toFixed(2)),
      classification,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi tính điểm trung bình lớp" });
  }
};
