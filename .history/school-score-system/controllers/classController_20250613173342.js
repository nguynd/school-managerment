const pool = require("../db");

/* ================== LẤY TẤT CẢ LỚP ================== */
exports.getAllClasses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.name,
        u.name AS teacher_name,
        COUNT(s.id) AS student_count
      FROM classes c
      LEFT JOIN class_homeroom_teachers cht ON cht.class_id = c.id
      LEFT JOIN users u ON u.id = cht.teacher_id AND u.role = 'teacher'
      LEFT JOIN students s ON s.class_id = c.id
      GROUP BY c.id, c.name, u.name
      ORDER BY c.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi getAllClasses:", err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách lớp" });
  }
};

/* ================== TẠO LỚP + GÁN GVCN ================== */
exports.createClass = async (req, res) => {
  const { name, teacher_id } = req.body; // teacher_id là users.id của giáo viên chủ nhiệm (tùy chọn)
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1️⃣  Insert lớp
    const classResult = await client.query(
      "INSERT INTO classes (name) VALUES ($1) RETURNING *",
      [name]
    );
    const classId = classResult.rows[0].id;

    // 2️⃣  Gán GVCN nếu có
    if (teacher_id) {
      await client.query(
        "INSERT INTO class_homeroom_teachers (class_id, teacher_id) VALUES ($1, $2)",
        [classId, teacher_id]
      );
    }

    await client.query("COMMIT");
    res.status(201).json(classResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Lỗi createClass:", err);
    res.status(500).json({ error: "Lỗi khi tạo lớp học" });
  } finally {
    client.release();
  }
};

/* ================== CẬP NHẬT LỚP + ĐỔI GVCN ================== */
exports.updateClass = async (req, res) => {
  const { id } = req.params;
  const { name, teacher_id } = req.body; // teacher_id mới (có thể null)
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣  Cập nhật tên lớp
    await client.query("UPDATE classes SET name = $1 WHERE id = $2", [name, id]);

    // 2️⃣  Xóa liên kết GVCN cũ
    await client.query("DELETE FROM class_homeroom_teachers WHERE class_id = $1", [id]);

    // 3️⃣  Tạo liên kết GVCN mới nếu có
    if (teacher_id) {
      await client.query(
        "INSERT INTO class_homeroom_teachers (class_id, teacher_id) VALUES ($1, $2)",
        [id, teacher_id]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Cập nhật lớp thành công" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Lỗi updateClass:", err);
    res.status(500).json({ error: "Lỗi khi cập nhật lớp học" });
  } finally {
    client.release();
  }
};

/* ================== XOÁ LỚP ================== */
exports.deleteClass = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM class_homeroom_teachers WHERE class_id = $1", [id]);
    await client.query("DELETE FROM classes WHERE id = $1", [id]);
    await client.query("COMMIT");
    res.json({ message: "Đã xoá lớp học" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Lỗi deleteClass:", err);
    res.status(500).json({ error: "Lỗi khi xoá lớp học" });
  } finally {
    client.release();
  }
};

/* ================== CÁC HÀM KHÁC GIỮ NGUYÊN ================== */
// getClassStudents & getClassAverage như bạn đã có ở dưới
