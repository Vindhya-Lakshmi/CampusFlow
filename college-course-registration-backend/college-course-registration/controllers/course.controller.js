const pool = require("../config/db");

const getAllCourses = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Course");
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Course WHERE course_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { course_code, course_name, credits, faculty_id } = req.body;

    if (!course_code || !course_name || !credits || !faculty_id) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO Course (course_code, course_name, credits, faculty_id)
       VALUES (?, ?, ?, ?)`,
      [course_code, course_name, credits, faculty_id]
    );

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: { course_id: result.insertId, ...req.body },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "Course code already exists" });
    }
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ success: false, message: "faculty_id does not exist" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { course_code, course_name, credits, faculty_id } = req.body;

    const [result] = await pool.query(
      `UPDATE Course SET course_code = ?, course_name = ?, credits = ?, faculty_id = ?
       WHERE course_id = ?`,
      [course_code, course_name, credits, faculty_id, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, message: "Course updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM Course WHERE course_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
