const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// ==========================================
// REGISTER
// ==========================================
const register = async (req, res) => {
  const {
    full_name,
    email,
    password,
    role = "student",
    contact_number,
    department,
    year_of_study,
    designation,
  } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Full name, email and password are required",
    });
  }

  if (!["student", "faculty"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Only student or faculty registration is allowed",
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Check whether email already exists
    const [existingUser] = await connection.query(
      "SELECT user_id FROM `User` WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    let studentId = null;
    let facultyId = null;

    // ==========================================
    // STUDENT REGISTRATION
    // ==========================================
    if (role === "student") {
      if (
        !contact_number ||
        !department ||
        year_of_study === undefined ||
        year_of_study === null
      ) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message:
            "Contact number, department and year of study are required for students",
        });
      }

      const [studentResult] = await connection.query(
        `INSERT INTO Student
        (student_name, email, contact_number, department, year_of_study)
        VALUES (?, ?, ?, ?, ?)`,
        [
          full_name,
          email,
          contact_number,
          department,
          year_of_study,
        ]
      );

      studentId = studentResult.insertId;
    }

    // ==========================================
    // FACULTY REGISTRATION
    // ==========================================
    if (role === "faculty") {
      if (!department) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Department is required for faculty",
        });
      }

      const [facultyResult] = await connection.query(
        `INSERT INTO Faculty
        (faculty_name, email, department, designation)
        VALUES (?, ?, ?, ?)`,
        [full_name, email, department, designation || null]
      );

      facultyId = facultyResult.insertId;
    }

    // ==========================================
    // CREATE USER ACCOUNT
    // ==========================================
    const [userResult] = await connection.query(
      `INSERT INTO \`User\`
      (full_name, email, password_hash, role, student_id, faculty_id)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        full_name,
        email,
        passwordHash,
        role,
        studentId,
        facultyId,
      ]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        user_id: userResult.insertId,
        full_name,
        email,
        role,
        student_id: studentId,
        faculty_id: facultyId,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  } finally {
    connection.release();
  }
};

// ==========================================
// LOGIN
// ==========================================
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const [users] = await db.query(
      `SELECT
        user_id,
        full_name,
        email,
        password_hash,
        role,
        student_id,
        faculty_id
       FROM \`User\`
       WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    // Compare entered password with hashed password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        student_id: user.student_id,
        faculty_id: user.faculty_id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        student_id: user.student_id,
        faculty_id: user.faculty_id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// ==========================================
// GET CURRENT USER
// ==========================================
// ==========================================
// GET CURRENT USER
// ==========================================
const getCurrentUser = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT
        u.user_id,
        u.full_name,
        u.email,
        u.role,
        u.student_id,
        u.faculty_id,
        u.created_at,
        s.contact_number,
        s.department,
        s.year_of_study
       FROM \`User\` u
       LEFT JOIN Student s
         ON u.student_id = s.student_id
       WHERE u.user_id = ?`,
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
};