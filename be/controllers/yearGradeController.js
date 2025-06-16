const pool = require("../db");

/**
 * Helper: tính điểm TB một học kỳ + xếp loại
 */
async function calcSemesterAvgAndGrade(client, student_id, semester, year) {
  // ❶ Tính TB từng môn theo công thức trong gradingController
  const avgRes = await client.query(
    `
    SELECT
      (
        (
          COALESCE(s.tx1,0) + COALESCE(s.tx2,0) + COALESCE(s.tx3,0)
        ) * sub.regular_weight
        + COALESCE(s.gk,0) * sub.mid_weight
        + COALESCE(s.ck,0) * sub.final_weight
      ) /
      (
        3*sub.regular_weight + sub.mid_weight + sub.final_weight
      ) AS subject_avg
    FROM scores s
    JOIN subjects sub ON sub.id = s.subject_id
    WHERE s.student_id = $1 AND s.semester = $2 AND s.year = $3
    `,
    [student_id, semester, year]
  );

  const avgs = avgRes.rows.map(r => Number(r.subject_avg));
  if (avgs.length === 0) return { score: null, grade: "Chưa có điểm" };

  const semAvg = avgs.reduce((sum, v) => sum + v, 0) / avgs.length;

  // ❷ Lấy tên học lực
  const gradeRes = await client.query(
    `SELECT name FROM grading_levels WHERE $1 >= min_score AND $1 < max_score LIMIT 1`,
    [semAvg]
  );
  const grade = gradeRes.rows[0]?.name || "Chưa xếp loại";

  return { score: Number(semAvg.toFixed(2)), grade };
}

/* =====================  API: POST /yearly-grades/calculate  ===================== */
exports.calculateYearlyGrade = async (req, res) => {
  const { student_id, year } = req.body;
  if (!student_id || !year) {
    return res.status(400).json({ error: "Thiếu student_id hoặc year" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // HK1
    const hk1 = await calcSemesterAvgAndGrade(client, student_id, "HK1", year);
    // HK2
    const hk2 = await calcSemesterAvgAndGrade(client, student_id, "HK2", year);

    if (hk1.score === null || hk2.score === null) {
      await client.query("ROLLBACK");
      return res
        .status(422)
        .json({ error: "Thiếu điểm HK1 hoặc HK2 để tính trung bình năm" });
    }

    // Trung bình năm = (HK1 + HK2) / 2
    const yearScore = Number(((hk1.score + hk2.score) / 2).toFixed(2));

    // Xếp loại năm
    const gradeRes = await client.query(
      `SELECT name FROM grading_levels WHERE $1 >= min_score AND $1 < max_score LIMIT 1`,
      [yearScore]
    );
    const yearGrade = gradeRes.rows[0]?.name || "Chưa xếp loại";

    // Upsert vào yearly_grades
    const upsertRes = await client.query(
      `
      INSERT INTO yearly_grades
        (student_id, year, hk1_score, hk1_grade, hk2_score, hk2_grade, year_score, year_grade)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (student_id, year) DO UPDATE
        SET hk1_score = EXCLUDED.hk1_score,
            hk1_grade = EXCLUDED.hk1_grade,
            hk2_score = EXCLUDED.hk2_score,
            hk2_grade = EXCLUDED.hk2_grade,
            year_score = EXCLUDED.year_score,
            year_grade = EXCLUDED.year_grade
      RETURNING *
      `,
      [
        student_id,
        year,
        hk1.score,
        hk1.grade,
        hk2.score,
        hk2.grade,
        yearScore,
        yearGrade,
      ]
    );

    await client.query("COMMIT");
    res.json(upsertRes.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ calculateYearlyGrade:", err);
    res.status(500).json({ error: "Lỗi tính điểm trung bình năm" });
  } finally {
    client.release();
  }
};

/* =====================  API: GET /yearly-grades?student_id=&year=  ===================== */
exports.getYearlyGrade = async (req, res) => {
  const { student_id, year } = req.query;
  if (!student_id || !year) {
    return res.status(400).json({ error: "Thiếu student_id hoặc year" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM yearly_grades WHERE student_id = $1 AND year = $2`,
      [student_id, year]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Chưa có dữ liệu năm này" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ getYearlyGrade:", err);
    res.status(500).json({ error: "Lỗi khi lấy điểm trung bình năm" });
  }
};
