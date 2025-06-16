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

exports.getMyAverages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester, year } = req.query;

    if (!semester || !year) {
      return res.status(400).json({ error: "Thiếu semester hoặc year" });
    }

    // Lấy student_id từ user_id
    const studentResult = await pool.query(
      "SELECT id FROM students WHERE user_id = $1",
      [userId]
    );
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy học sinh" });
    }

    const student_id = studentResult.rows[0].id;

    // Truy vấn tính trung bình từng môn
    const result = await pool.query(`
      SELECT 
        s.subject_id,
        sub.name AS subject_name,
        ROUND(
          (
            (COALESCE(s.tx1, 0) + COALESCE(s.tx2, 0) + COALESCE(s.tx3, 0)) * sub.regular_weight +
            COALESCE(s.gk, 0) * sub.mid_weight +
            COALESCE(s.ck, 0) * sub.final_weight
          ) / (
            3 * sub.regular_weight + sub.mid_weight + sub.final_weight
          ),
          2
        ) AS average
      FROM scores s
      JOIN subjects sub ON sub.id = s.subject_id
      WHERE s.student_id = $1 AND s.semester = $2 AND s.year = $3
      ORDER BY sub.name
    `, [student_id, semester, year]);

    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi khi tính điểm trung bình:", err);
    res.status(500).json({ error: "Lỗi server khi tính điểm trung bình" });
  }
};

exports.getMySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester, year } = req.query;

    if (!semester || !year) {
      return res.status(400).json({ error: "Thiếu semester hoặc year" });
    }

    // Tìm student_id theo user_id
    const studentRes = await pool.query(
      "SELECT id FROM students WHERE user_id = $1",
      [userId]
    );
    if (studentRes.rowCount === 0) {
      return res.status(404).json({ error: "Không tìm thấy học sinh" });
    }

    const student_id = studentRes.rows[0].id;

    // ✅ Tính điểm trung bình toàn học kỳ (không dùng GROUP BY)
   const avgRes = await pool.query(`
  SELECT 
    ROUND(
      SUM(
        (COALESCE(s.tx1, 0) + COALESCE(s.tx2, 0) + COALESCE(s.tx3, 0)) * sub.regular_weight +
        COALESCE(s.gk, 0) * sub.mid_weight +
        COALESCE(s.ck, 0) * sub.final_weight
      ) / 
      NULLIF(
        SUM(
          3 * sub.regular_weight + sub.mid_weight + sub.final_weight
        ),
        0
      )::numeric
    , 2) AS average
  FROM scores s
  JOIN subjects sub ON sub.id = s.subject_id
  WHERE s.student_id = $1 AND s.semester = $2 AND s.year = $3
`, [student_id, semester, year]);


    const average = avgRes.rows[0]?.average;

    if (average === null) {
      return res.status(200).json({ average: null, grade: "Chưa có điểm" });
    }

    // ✅ Phân loại học lực theo bảng grading_levels
    const gradeRes = await pool.query(
      `SELECT name FROM grading_levels WHERE $1 >= min_score AND $1 < max_score LIMIT 1`,
      [average]
    );

    const grade = gradeRes.rows[0]?.name || "Không xác định";

    res.json({ average, grade });
  } catch (err) {
    console.error("Lỗi khi tính tổng kết học kỳ:", err);
    res.status(500).json({ error: "Lỗi server khi tính tổng kết học kỳ" });
  }
};
