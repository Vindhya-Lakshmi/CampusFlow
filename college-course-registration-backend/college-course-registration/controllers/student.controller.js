const pool = require("../config/db");

// GET all students
const getAllStudents = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Student");
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single student by ID
const getStudentById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Student WHERE student_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST create a new student
const createStudent = async (req, res) => {
  try {
    const { student_name, email, contact_number, department, year_of_study } =
      req.body;

    if (!student_name || !email || !contact_number || !department || !year_of_study) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO Student (student_name, email, contact_number, department, year_of_study)
       VALUES (?, ?, ?, ?, ?)`,
      [student_name, email, contact_number, department, year_of_study]
    );

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: { student_id: result.insertId, ...req.body },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ success: false, message: "Email or contact number already exists" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update a student
const updateStudent = async (req, res) => {
  try {
    const { student_name, email, contact_number, department, year_of_study } =
      req.body;

    const [result] = await pool.query(
      `UPDATE Student SET student_name = ?, email = ?, contact_number = ?,
       department = ?, year_of_study = ? WHERE student_id = ?`,
      [student_name, email, contact_number, department, year_of_study, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, message: "Student updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE a student
const deleteStudent = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM Student WHERE student_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
