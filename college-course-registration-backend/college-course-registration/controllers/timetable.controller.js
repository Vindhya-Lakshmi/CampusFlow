const pool = require("../config/db");

// GET timetable for a specific student
const getStudentTimetable = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        t.timetable_id,
        t.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        t.day_of_week,
        t.start_time,
        t.end_time,
        t.room_number
      FROM Timetable t
      JOIN Course c
        ON t.course_id = c.course_id
      JOIN Registration r
        ON r.course_id = t.course_id
      WHERE r.student_id = ?
      ORDER BY
        FIELD(
          t.day_of_week,
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday'
        ),
        t.start_time
      `,
      [req.params.studentId]
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Failed to fetch student timetable:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getStudentTimetable,
};