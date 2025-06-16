const pool = require("../db");

// GET /scores
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

// POST /scores
exports.createScore = async (req, res) => {
  const { student_id, subject_id, semester, year, tx1, tx2, tx3, gk, ck } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO scores (student_id, subject_id, semester, year, tx1, tx2, tx3, gk, ck)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [student_id, subject_id, semester, year, tx1, tx2, tx3, gk, ck]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi tạo điểm" });
  }
};

// PUT /scores/:id
exports.updateScore = async (req, res) => {
  const teacherId = req.user.id;
  const scoreId = req.params.id;
  const { tx1, tx2, tx3, gk, ck } = req.body;

  try {
    const authCheck = await pool.query(
      `SELECT 1
       FROM scores sc
       JOIN students s ON sc.student_id = s.id
       WHERE sc.id = $1
       AND EXISTS (
         SELECT 1 FROM subject_teachers st
         WHERE st.teacher_id = $2
         AND st.subject_id = sc.subject_id
         AND st.class_id = s.class_id
       )`,
      [scoreId, teacherId]
    );

    if (authCheck.rowCount === 0) {
      return res.status(403).json({ error: "Bạn không có quyền sửa điểm này" });
    }

    const result = await pool.query(
      `UPDATE scores
       SET tx1 = $1, tx2 = $2, tx3 = $3, gk = $4, ck = $5
       WHERE id = $6 RETURNING *`,
      [tx1, tx2, tx3, gk, ck, scoreId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi cập nhật điểm" });
  }
};

// DELETE /scores/:id
exports.deleteScore = async (req, res) => {
  const teacherId = req.user.id;
  const scoreId = req.params.id;

  try {
    const authCheck = await pool.query(
      `SELECT 1
       FROM scores sc
       JOIN students s ON sc.student_id = s.id
       WHERE sc.id = $1
       AND EXISTS (
         SELECT 1 FROM subject_teachers st
         WHERE st.teacher_id = $2
         AND st.subject_id = sc.subject_id
         AND st.class_id = s.class_id
       )`,
      [scoreId, teacherId]
    );

    if (authCheck.rowCount === 0) {
      return res.status(403).json({ error: "Bạn không có quyền xoá điểm này" });
    }

    await pool.query("DELETE FROM scores WHERE id = $1", [scoreId]);
    res.json({ message: "Đã xoá điểm" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi xoá điểm" });
  }
};

// GET /scores/teacher
// controllers/scoreController.js
// GET /scores/teacher
exports.getScoresBySubjectTeacher = async (req, res) => {
  const teacherId = req.user.id;

  const query = `
    SELECT
      sc.id AS score_id,
      sc.student_id,
      sc.subject_id,
      c.id AS class_id, -- ✅ THÊM DÒNG NÀY
      s.name AS student_name,
      s.date_of_birth,       
      sb.name AS subject_name,
      sb.regular_weight,
      sb.mid_weight,
      sb.final_weight,
      sc.semester,
      sc.year,
      sc.tx1, sc.tx2, sc.tx3, sc.gk, sc.ck,
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



// GET /scores/homeroom
exports.getScoresByHomeroomTeacher = async (req, res) => {
  const teacherId = req.user.id;

  const query = `
    SELECT
      sc.id AS score_id,
      s.name AS student_name,
      sb.name AS subject_name,
      sc.semester,
      sc.year,
      sc.tx1, sc.tx2, sc.tx3, sc.gk, sc.ck,
      c.name AS class_name
    FROM scores sc
    JOIN students s ON sc.student_id = s.id
    JOIN subjects sb ON sc.subject_id = sb.id
    JOIN classes c ON s.class_id = c.id
    JOIN class_homeroom_teachers cht
      ON cht.teacher_id = $1 AND cht.class_id = s.class_id
  `;

  try {
    const result = await pool.query(query, [teacherId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi lấy điểm của giáo viên chủ nhiệm' });
  }
};

// POST /scores/init-semester
exports.initSemesterScores = async (req, res) => {
  const { semester, year } = req.body;

  if (!semester || !year) {
    return res.status(400).json({ error: "Thiếu semester hoặc year" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const students = await client.query(`SELECT id FROM students`);
    const subjects = await client.query(`SELECT id FROM subjects`);

    for (const student of students.rows) {
      for (const subject of subjects.rows) {
        await client.query(
          `INSERT INTO scores (student_id, subject_id, semester, year, tx1, tx2, tx3, gk, ck)
           VALUES ($1, $2, $3, $4, NULL, NULL, NULL, NULL, NULL)`,
          [student.id, subject.id, semester, year]
        );
      }
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Khởi tạo thành công" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Lỗi khởi tạo kỳ học" });
  } finally {
    client.release();
  }
};
