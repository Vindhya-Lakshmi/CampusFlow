const pool = require("../config/db");

const getStudentAttendance = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        a.attendance_id,
        a.student_id,
        a.course_id,
        c.course_code,
        c.course_name,
        a.total_classes,
        a.attended_classes
      FROM Attendance a
      JOIN Course c
        ON a.course_id = c.course_id
      WHERE a.student_id = ?
      ORDER BY c.course_code
      `,
      [req.params.studentId]
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Failed to fetch attendance:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getStudentAttendance,
};