const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Incorrect password" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role FROM users ORDER BY id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Tạo user mới
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
      [name, email, hashed, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Lỗi khi tạo user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Cập nhật user
exports.updateUser = async (req, res) => {
  const id = req.params.id;
  const { name, role } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET name = $1, role = $2 WHERE id = $3 RETURNING id, name, email, role`,
      [name, role, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Lỗi khi cập nhật user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Xoá user
exports.deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "User đã được xoá" });
  } catch (err) {
    console.error("Lỗi khi xoá user:", err);
    res.status(500).json({ error: "Server error" });
  }
};