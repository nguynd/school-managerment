const pool = require("../db");

exports.getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT students.id, students.name, students.date_of_birth, students.gender, classes.name AS class_name
      FROM students
      LEFT JOIN classes ON students.class_id = classes.id
      ORDER BY students.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi lấy danh sách học sinh" });
  }
};


exports.createStudent = async (req, res) => {
  const { name, date_of_birth, class_id, gender } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ✅ Bước 1: Thêm học sinh
    const studentResult = await client.query(
      `INSERT INTO students (name, date_of_birth, class_id, gender) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, date_of_birth, class_id, gender]
    );
    const newStudent = studentResult.rows[0];

    // ✅ Bước 2: Lấy danh sách môn học
    const subjectsResult = await client.query(`SELECT id FROM subjects`);
    const subjects = subjectsResult.rows;

    // ✅ Bước 3: Tạo điểm rỗng cho từng môn
    const semester = "HK1";
    const year = 2024;

    for (const subject of subjects) {
      await client.query(
        `INSERT INTO scores 
          (student_id, subject_id, semester, year, tx1, tx2, tx3, gk, ck) 
         VALUES ($1, $2, $3, $4, NULL, NULL, NULL, NULL, NULL)`,
        [newStudent.id, subject.id, semester, year]
      );
    }

    await client.query("COMMIT");
    res.status(201).json(newStudent);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Lỗi tạo học sinh hoặc điểm ban đầu" });
  } finally {
    client.release();
  }
};

exports.updateStudent = async (req, res) => {
  const { name, date_of_birth, class_id, gender } = req.body;
  const id = req.params.id;

  try {
    const result = await pool.query(
      `UPDATE students 
       SET name = $1, date_of_birth = $2, class_id = $3, gender = $4
       WHERE id = $5 RETURNING *`,
      [name, date_of_birth, class_id, gender, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi cập nhật học sinh" });
  }
};

exports.deleteStudent = async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM students WHERE id = $1", [id]);
    res.json({ message: "Đã xoá học sinh" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi xoá học sinh" });
  }
};

// lấy thông tin học sinh kèm điểm trung bình, xếp loại
exports.getStudentsWithGrading = async (req, res) => {
  const classId = req.params.id;
  const { semester, year } = req.query;

  if (!semester || !year) {
    return res.status(400).json({ error: "Thiếu semester hoặc year" });
  }

  try {
    const studentRes = await pool.query(
      `SELECT id, name, date_of_birth, gender FROM students WHERE class_id = $1`,
      [classId]
    );

    const students = studentRes.rows;
    const resultList = [];

    for (const student of students) {
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
        [student.id, semester, year]
      );

      const averages = avgPerSubjectResult.rows.map(r => Number(r.subject_avg));
      const overallAverage = averages.length
        ? averages.reduce((sum, val) => sum + val, 0) / averages.length
        : null;

      let grade = "Chưa xếp loại";
      if (overallAverage !== null) {
        const gradeResult = await pool.query(
          `SELECT name FROM grading_levels WHERE $1 >= min_score AND $1 < max_score LIMIT 1`,
          [overallAverage]
        );
        grade = gradeResult.rows[0]?.name || "Chưa xếp loại";
      }

      resultList.push({
        id: student.id,
        name: student.name,
        date_of_birth: student.date_of_birth,
        gender: student.gender,
        average: overallAverage?.toFixed(2),
        classification: grade,
      });
    }

    res.json(resultList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi lấy danh sách học sinh kèm xếp loại" });
  }
};

exports.getStudentsByClass = async (req, res) => {
  const classId = req.params.classId;

  try {
    const result = await pool.query(
  `SELECT 
     students.id, 
     students.name, 
     students.date_of_birth, 
     students.gender, 
     students.user_id,
     users.email
   FROM students
   LEFT JOIN users ON students.user_id = users.id
   WHERE students.class_id = $1
   ORDER BY students.id`,
  [classId]
);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Lỗi lấy học sinh theo lớp:", err);
    res.status(500).json({ error: "Lỗi lấy danh sách học sinh theo lớp" });
  }
};
