const pool = require("../db");

exports.getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT students.id, students.name, students.date_of_birth, classes.name AS class_name
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
  const { name, date_of_birth, class_id } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ✅ Bước 1: Thêm học sinh
    const studentResult = await client.query(
      `INSERT INTO students (name, date_of_birth, class_id) 
       VALUES ($1, $2, $3) RETURNING *`,
      [name, date_of_birth, class_id]
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
  const { name, date_of_birth, class_id } = req.body;
  const id = req.params.id;
  try {
    const result = await pool.query(
      `UPDATE students SET name = $1, date_of_birth = $2, class_id = $3 
       WHERE id = $4 RETURNING *`,
      [name, date_of_birth, class_id, id]
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
