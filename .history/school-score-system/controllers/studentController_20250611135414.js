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
