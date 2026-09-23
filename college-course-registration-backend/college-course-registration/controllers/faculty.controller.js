const pool = require("../config/db");

const getAllFaculty = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Faculty");
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFacultyById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Faculty WHERE faculty_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createFaculty = async (req, res) => {
  try {
    const { faculty_name, email, department, designation } = req.body;

    if (!faculty_name || !email || !department) {
      return res
        .status(400)
        .json({ success: false, message: "faculty_name, email, and department are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO Faculty (faculty_name, email, department, designation)
       VALUES (?, ?, ?, ?)`,
      [faculty_name, email, department, designation || null]
    );

    res.status(201).json({
      success: true,
      message: "Faculty created successfully",
      data: { faculty_id: result.insertId, ...req.body },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFaculty = async (req, res) => {
  try {
    const { faculty_name, email, department, designation } = req.body;

    const [result] = await pool.query(
      `UPDATE Faculty SET faculty_name = ?, email = ?, department = ?, designation = ?
       WHERE faculty_id = ?`,
      [faculty_name, email, department, designation, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    res.status(200).json({ success: true, message: "Faculty updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM Faculty WHERE faculty_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    res.status(200).json({ success: true, message: "Faculty deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};
