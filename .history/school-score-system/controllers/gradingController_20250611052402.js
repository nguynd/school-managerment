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
    const avgResult = await pool.query(
      `
      SELECT
        SUM(
          CASE 
            WHEN s.label LIKE 'TX%' THEN s.score * sub.regular_weight
            WHEN s.label = 'GK' THEN s.score * sub.mid_weight
            WHEN s.label = 'CK' THEN s.score * sub.final_weight
            ELSE 0
          END
        )::numeric /
        NULLIF(
          SUM(
            CASE 
              WHEN s.label LIKE 'TX%' THEN sub.regular_weight
              WHEN s.label = 'GK' THEN sub.mid_weight
              WHEN s.label = 'CK' THEN sub.final_weight
              ELSE 0
            END
          ),
          0
        ) AS average
      FROM scores s
      JOIN subjects sub ON s.subject_id = sub.id
      WHERE s.student_id = $1 AND s.semester = $2 AND s.year = $3
      `,
      [student_id, semester, year]
    );

    const average = avgResult.rows[0]?.average;
    if (average === null || average === undefined) {
      return res.status(404).json({ error: "Không tìm thấy điểm để tính xếp loại" });
    }

    const gradeResult = await pool.query(
      `
      SELECT name FROM grading_levels
      WHERE $1 >= min_score AND $1 < max_score
      LIMIT 1
      `,
      [average]
    );

    const grade = gradeResult.rows[0]?.name || "Chưa xếp loại";

    res.json({
      student_id,
      semester,
      year,
      average: Number(average).toFixed(2),
      grade
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi tính xếp loại học lực" });
  }
};
