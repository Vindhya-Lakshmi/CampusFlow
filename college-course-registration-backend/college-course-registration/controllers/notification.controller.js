const pool = require("../config/db");

const getStudentNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        notification_id,
        student_id,
        title,
        message,
        is_read,
        created_at
       FROM Notification
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [req.params.studentId]
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE Notification
       SET is_read = TRUE
       WHERE notification_id = ?`,
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      message: result.affectedRows
        ? "Notification marked as read."
        : "Notification not found.",
    });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const createNotification = async (req, res) => {
  try {
    const { student_id, title, message } = req.body;

    if (!student_id || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "student_id, title, and message are required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO Notification
       (student_id, title, message)
       VALUES (?, ?, ?)`,
      [student_id, title, message]
    );

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: {
        notification_id: result.insertId,
        student_id,
        title,
        message,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getAllNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        n.notification_id,
        n.student_id,
        s.student_name,
        n.title,
        n.message,
        n.is_read,
        n.created_at
       FROM Notification n
       JOIN Student s
         ON n.student_id = s.student_id
       ORDER BY n.created_at DESC`
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Failed to fetch all notifications:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getStudentNotifications,
  markNotificationAsRead,
  createNotification,
  getAllNotifications,
};