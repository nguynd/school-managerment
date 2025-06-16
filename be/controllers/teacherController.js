const pool = require("../db");

// Lấy danh sách người dùng có vai trò là giáo viên
exports.getAllTeachers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name FROM users WHERE role = 'teacher' ORDER BY name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách giáo viên:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};
