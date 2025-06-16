const pool = require("../db");

exports.getStudentAverages = async (req, res) => {
  const { student_id, semester, year } = req.query;

  if (!student_id || !semester || !year) {
    return res.status(400).json({ error: "Thiếu student_id, semester hoặc year" });
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        s.subject_id,
        sub.name AS subject_name,
        ROUND(
          SUM(
            CASE 
              WHEN s.label LIKE 'TX%' THEN s.score * sub.regular_weight
              WHEN s.label = 'GK' THEN s.score * sub.mid_weight
              WHEN s.label = 'CK' THEN s.score * sub.final_weight
              ELSE 0
            END
          )::numeric / 
          NULLIF(
            COUNT(CASE WHEN s.label LIKE 'TX%' THEN 1 END) * sub.regular_weight +
            COUNT(CASE WHEN s.label = 'GK' THEN 1 END) * sub.mid_weight +
            COUNT(CASE WHEN s.label = 'CK' THEN 1 END) * sub.final_weight, 0
          ),
        2) AS average
      FROM scores s
      JOIN subjects sub ON s.subject_id = sub.id
      WHERE s.student_id = $1 AND s.semester = $2 AND s.year = $3
      GROUP BY s.subject_id, sub.name, sub.regular_weight, sub.mid_weight, sub.final_weight
      ORDER BY sub.name
      `,
      [student_id, semester, year]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi tính điểm trung bình" });
  }
};

exports.getOverallAverage = async (req, res) => {
  const { student_id, semester, year } = req.query;

  if (!student_id || !semester || !year) {
    return res.status(400).json({ error: "Thiếu student_id, semester hoặc year" });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        ROUND(
          SUM(
            CASE 
              WHEN s.label LIKE 'TX%' THEN s.score * sub.regular_weight
              WHEN s.label = 'GK' THEN s.score * sub.mid_weight
              WHEN s.label = 'CK' THEN s.score * sub.final_weight
              ELSE 0
            END
          )::numeric
        / 
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
          ), 2
        ) AS average_all_subjects
      FROM scores s
      JOIN subjects sub ON s.subject_id = sub.id
      WHERE s.student_id = $1 AND s.semester = $2 AND s.year = $3
      `,
      [student_id, semester, year]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi tính điểm trung bình toàn học kỳ" });
  }
};
