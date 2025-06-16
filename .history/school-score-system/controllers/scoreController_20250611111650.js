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
  const teacherId = req.user.id;
  const scoreId = req.params.id;
  const { score } = req.body;

  try {
    // ✅ BƯỚC 1: Kiểm tra giáo viên có thực sự dạy môn và lớp đó không
    const authCheck = await pool.query(`
      SELECT 1
      FROM scores sc
      JOIN students s ON sc.student_id = s.id
      WHERE sc.id = $1
      AND EXISTS (
        SELECT 1 FROM subject_teachers st
        WHERE st.teacher_id = $2
        AND st.subject_id = sc.subject_id
        AND st.class_id = s.class_id
      )
    `, [scoreId, teacherId]);

    // ❌ Nếu không có quyền → trả lỗi
    if (authCheck.rowCount === 0) {
      return res.status(403).json({ error: "Bạn không có quyền sửa điểm này" });
    }

    // ✅ BƯỚC 2: Cập nhật điểm
    const result = await pool.query(
      `UPDATE scores SET score = $1 WHERE id = $2 RETURNING *`,
      [score, scoreId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi cập nhật điểm" });
  }
};


exports.deleteScore = async (req, res) => {
  const teacherId = req.user.id;
  const scoreId = req.params.id;

  try {
    // ✅ BƯỚC 1: Kiểm tra quyền xoá giống như update
    const authCheck = await pool.query(`
      SELECT 1
      FROM scores sc
      JOIN students s ON sc.student_id = s.id
      WHERE sc.id = $1
      AND EXISTS (
        SELECT 1 FROM subject_teachers st
        WHERE st.teacher_id = $2
        AND st.subject_id = sc.subject_id
        AND st.class_id = s.class_id
      )
    `, [scoreId, teacherId]);

    if (authCheck.rowCount === 0) {
      return res.status(403).json({ error: "Bạn không có quyền xoá điểm này" });
    }

    // ✅ BƯỚC 2: Thực hiện xoá
    await pool.query("DELETE FROM scores WHERE id = $1", [scoreId]);
    res.json({ message: "Đã xoá điểm" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi xoá điểm" });
  }
};


// ✅ [GET] /scores/teacher - điểm theo giáo viên bộ môn (an toàn)
exports.getScoresBySubjectTeacher = async (req, res) => {
  const teacherId = req.user.id;

  const query = `
    SELECT
      sc.id AS score_id,
      sc.student_id,        -- ✅ thêm student_id
      sc.subject_id,        -- ✅ thêm subject_id
      s.name AS student_name,
      sb.name AS subject_name,
      sc.semester,
      sc.year,
      sc.score,
      sc.label,
      c.name AS class_name
    FROM scores sc
    JOIN students s ON sc.student_id = s.id
    JOIN subjects sb ON sc.subject_id = sb.id
    JOIN classes c ON s.class_id = c.id
    WHERE EXISTS (
      SELECT 1 FROM subject_teachers st
      WHERE st.teacher_id = $1
        AND st.subject_id = sc.subject_id
        AND st.class_id = s.class_id
    )
  `;

  try {
    const result = await pool.query(query, [teacherId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi lấy điểm của giáo viên bộ môn' });
  }
};

// ✅ [GET] /scores/homeroom - điểm theo giáo viên chủ nhiệm
exports.getScoresByHomeroomTeacher = async (req, res) => {
  const teacherId = req.user.id;
  const query = `
    SELECT
      sc.id AS score_id,
      s.name AS student_name,
      sb.name AS subject_name,
      sc.semester,
      sc.year,
      sc.score,
      sc.label,
      c.name AS class_name
    FROM scores sc
    JOIN students s ON sc.student_id = s.id
    JOIN subjects sb ON sc.subject_id = sb.id
    JOIN classes c ON s.class_id = c.id
    JOIN class_homeroom_teachers cht ON
        cht.teacher_id = $1 AND
        cht.class_id = s.class_id
  `;
  try {
    const result = await pool.query(query, [teacherId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi lấy điểm của giáo viên chủ nhiệm' });
  }
};
