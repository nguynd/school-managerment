const pool = require("../db");

exports.getAllGradings = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, min_score, max_score FROM grading_levels ORDER BY min_score ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách phân loại học lực" });
  }
};

exports.getStudentGrading = async (req, res) => {
  const student_id = req.params.student_id;
  const { semester, year } = req.query;

  if (!semester || !year) {
    return res.status(400).json({ error: "Thiếu semester hoặc year" });
  }

  try {
    // Tính điểm trung bình từng môn
    const avgPerSubjectResult = await pool.query(
      `
      SELECT
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
      JOIN subjects sub ON s.subject_id = sub.id
      WHERE s.student_id = $1 AND s.semester = $2 AND s.year = $3
      `,
      [student_id, semester, year]
    );

    const averages = avgPerSubjectResult.rows.map(r => Number(r.subject_avg));
    if (averages.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy điểm để tính xếp loại" });
    }

    // Tính điểm trung bình học kỳ
    const overallAverage = averages.reduce((sum, val) => sum + val, 0) / averages.length;

    // Truy vấn phân loại
    const gradeResult = await pool.query(
      `
      SELECT name FROM grading_levels
      WHERE $1 >= min_score AND $1 < max_score
      LIMIT 1
      `,
      [overallAverage]
    );

    const grade = gradeResult.rows[0]?.name || "Chưa xếp loại";

    res.json({
      student_id,
      semester,
      year,
      average: overallAverage.toFixed(2),
      grade
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi tính xếp loại học lực" });
  }
};
