const pool = require("../config/db");

// GET all registrations (raw)
const getAllRegistrations = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        r.registration_id,
        r.student_id,
        s.student_name,
        r.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        r.registration_date,
        r.status
      FROM Registration r
      JOIN Student s
        ON r.student_id = s.student_id
      JOIN Course c
        ON r.course_id = c.course_id
      ORDER BY r.registration_date DESC
    `);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Failed to fetch all registrations:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST register a student for a course
const createRegistration = async (req, res) => {
  try {
    const { student_id, course_id, registration_date, status } = req.body;

    if (!student_id || !course_id || !registration_date) {
      return res.status(400).json({
        success: false,
        message: "student_id, course_id, and registration_date are required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO Registration (student_id, course_id, registration_date, status)
       VALUES (?, ?, ?, ?)`,
      [student_id, course_id, registration_date, status || "Registered"]
    );

    res.status(201).json({
      success: true,
      message: "Registration created successfully",
      data: { registration_id: result.insertId, ...req.body },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This student is already registered for this course",
      });
    }
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        success: false,
        message: "Invalid student_id or course_id",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update registration status
const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Registered", "Completed", "Dropped"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const [result] = await pool.query(
      "UPDATE Registration SET status = ? WHERE registration_id = ?",
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    res.status(200).json({ success: true, message: "Registration status updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE a registration (drop a course)
const deleteRegistration = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM Registration WHERE registration_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    res.status(200).json({ success: true, message: "Registration deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================================================
// Reporting endpoints — these are your JOIN queries,
// exposed as real API endpoints
// ===================================================

// GET the full student-course relationship (INNER JOIN)
const getStudentCourseRelationship = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.student_name, c.course_name, c.course_code, r.status
      FROM Registration r
      JOIN Student s ON r.student_id = s.student_id
      JOIN Course c ON r.course_id = c.course_id
    `);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET course-wise student list
const getCourseWiseStudentList = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.course_name, s.student_name, s.department
      FROM Registration r
      JOIN Course c ON r.course_id = c.course_id
      JOIN Student s ON r.student_id = s.student_id
      ORDER BY c.course_name
    `);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET all courses a specific student is registered for
const getStudentCourses = async (req, res) => {
  try {
   const [rows] = await pool.query(
  `SELECT r.registration_id, c.course_id, c.course_code, c.course_name, c.credits, r.status, r.registration_date
   FROM Registration r
   JOIN Course c ON r.course_id = c.course_id
   WHERE r.student_id = ?`,
      [req.params.studentId]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET registration stats — total, per department, per course
const getRegistrationStats = async (req, res) => {
  try {
    const [[totalRegistrations]] = await pool.query(
      "SELECT COUNT(*) AS total_registrations FROM Registration"
    );
    const [byDepartment] = await pool.query(
      "SELECT department, COUNT(*) AS student_count FROM Student GROUP BY department"
    );
    const [byCourse] = await pool.query(`
      SELECT c.course_name, COUNT(*) AS total_students
      FROM Registration r
      JOIN Course c ON r.course_id = c.course_id
      GROUP BY c.course_name
    `);
    const [facultyLoad] = await pool.query(`
      SELECT f.faculty_name, COUNT(c.course_id) AS courses_taught
      FROM Faculty f
      LEFT JOIN Course c ON f.faculty_id = c.faculty_id
      GROUP BY f.faculty_name
    `);

    res.status(200).json({
      success: true,
      data: {
        total_registrations: totalRegistrations.total_registrations,
        students_by_department: byDepartment,
        students_by_course: byCourse,
        faculty_teaching_load: facultyLoad,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllRegistrations,
  createRegistration,
  updateRegistrationStatus,
  deleteRegistration,
  getStudentCourseRelationship,
  getCourseWiseStudentList,
  getStudentCourses,
  getRegistrationStats,
};
