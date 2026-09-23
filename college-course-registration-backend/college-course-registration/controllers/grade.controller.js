const pool = require("../config/db");

// Get grades for a specific student
const getStudentGrades = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        g.grade_id,
        g.student_id,
        c.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        g.grade,
        g.grade_point
      FROM Grade g
      JOIN Course c
        ON g.course_id = c.course_id
      WHERE g.student_id = ?
      ORDER BY c.course_code
      `,
      [req.params.studentId]
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Failed to fetch student grades:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getStudentGrades,
};