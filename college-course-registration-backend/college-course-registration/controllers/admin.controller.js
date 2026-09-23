const pool = require("../config/db");

const getAdminStats = async (req, res) => {
    try {
        const [[studentResult]] = await pool.query(
            "SELECT COUNT(*) AS totalStudents FROM Student"
        );

        const [[facultyResult]] = await pool.query(
            "SELECT COUNT(*) AS totalFaculty FROM Faculty"
        );

        const [[courseResult]] = await pool.query(
            "SELECT COUNT(*) AS totalCourses FROM Course"
        );

        const [[registrationResult]] = await pool.query(
            "SELECT COUNT(*) AS totalRegistrations FROM Registration"
        );

        res.status(200).json({
            success: true,
            data: {
                totalStudents: studentResult.totalStudents,
                totalFaculty: facultyResult.totalFaculty,
                totalCourses: courseResult.totalCourses,
                totalRegistrations: registrationResult.totalRegistrations,
            },
        });
    } catch (error) {
        console.error("Failed to fetch admin statistics:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllStudents = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
       student_id,
       student_name,
       email,
       department,
       year_of_study
       FROM Student
       ORDER BY student_id`
        );

        res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error("Failed to fetch students:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getStudentRegistrations = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
        r.registration_id,
        r.student_id,
        r.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        r.registration_date
       FROM Registration r
       JOIN Course c
         ON r.course_id = c.course_id
       WHERE r.student_id = ?
       ORDER BY r.registration_date DESC`,
            [req.params.studentId]
        );

        res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error("Failed to fetch student registrations:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const getAllCourses = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
        c.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        c.faculty_id,
        f.faculty_name
       FROM Course c
       LEFT JOIN Faculty f
         ON c.faculty_id = f.faculty_id
       ORDER BY c.course_id`
        );

        res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error("Failed to fetch courses:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const getAllFaculty = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
        faculty_id,
        faculty_name,
        email,
        department,
        designation
       FROM Faculty
       ORDER BY faculty_id`
        );

        res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error("Failed to fetch faculty:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const addCourse = async (req, res) => {
    try {
        const {
            course_code,
            course_name,
            credits,
            faculty_id,
        } = req.body;

        if (!course_code || !course_name || !credits || !faculty_id) {
            return res.status(400).json({
                success: false,
                message: "All course fields are required.",
            });
        }

        const [result] = await pool.query(
            `INSERT INTO Course
        (course_code, course_name, credits, faculty_id)
       VALUES (?, ?, ?, ?)`,
            [
                course_code,
                course_name,
                credits,
                faculty_id,
            ]
        );

        res.status(201).json({
            success: true,
            message: "Course added successfully.",
            data: {
                course_id: result.insertId,
                course_code,
                course_name,
                credits,
                faculty_id,
            },
        });
    } catch (error) {
        console.error("Failed to add course:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Course code already exists.",
            });
        }

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { course_code, course_name, credits, faculty_id } = req.body;
        const { courseId } = req.params;

        if (!course_code || !course_name || !credits || !faculty_id) {
            return res.status(400).json({
                success: false,
                message: "All course fields are required.",
            });
        }

        const [result] = await pool.query(
            `UPDATE Course
             SET course_code = ?,
                 course_name = ?,
                 credits = ?,
                 faculty_id = ?
             WHERE course_id = ?`,
            [
                course_code,
                course_name,
                credits,
                faculty_id,
                courseId,
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Course updated successfully.",
        });
    } catch (error) {
        console.error("Failed to update course:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Course code already exists.",
            });
        }

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const [result] = await pool.query(
            `DELETE FROM Course
             WHERE course_id = ?`,
            [courseId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Course deleted successfully.",
        });
    } catch (error) {
        console.error("Failed to delete course:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const addFaculty = async (req, res) => {
    try {
        const {
            faculty_name,
            email,
            department,
            designation,
        } = req.body;

        if (!faculty_name || !email || !department) {
            return res.status(400).json({
                success: false,
                message: "Faculty name, email, and department are required.",
            });
        }

        const [result] = await pool.query(
            `INSERT INTO Faculty
                (faculty_name, email, department, designation)
             VALUES (?, ?, ?, ?)`,
            [
                faculty_name,
                email,
                department,
                designation || null,
            ]
        );

        res.status(201).json({
            success: true,
            message: "Faculty added successfully.",
            data: {
                faculty_id: result.insertId,
                faculty_name,
                email,
                department,
                designation: designation || null,
            },
        });
    } catch (error) {
        console.error("Failed to add faculty:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Faculty email already exists.",
            });
        }

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const updateFaculty = async (req, res) => {
    try {
        const {
            faculty_name,
            email,
            department,
            designation,
        } = req.body;

        const { facultyId } = req.params;

        if (!faculty_name || !email || !department) {
            return res.status(400).json({
                success: false,
                message: "Faculty name, email, and department are required.",
            });
        }

        const [result] = await pool.query(
            `UPDATE Faculty
             SET faculty_name = ?,
                 email = ?,
                 department = ?,
                 designation = ?
             WHERE faculty_id = ?`,
            [
                faculty_name,
                email,
                department,
                designation || null,
                facultyId,
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Faculty not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Faculty updated successfully.",
        });
    } catch (error) {
        console.error("Failed to update faculty:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Faculty email already exists.",
            });
        }

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
const deleteFaculty = async (req, res) => {
    try {
        const { facultyId } = req.params;

        const [result] = await pool.query(
            `DELETE FROM Faculty
             WHERE faculty_id = ?`,
            [facultyId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Faculty not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Faculty deleted successfully.",
        });
    } catch (error) {
        console.error("Failed to delete faculty:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
module.exports = {
    getAdminStats,
    getAllStudents,
    getStudentRegistrations,
    getAllCourses,
    updateCourse,
    deleteCourse,
    getAllFaculty,
    addCourse,
    addFaculty,
    updateFaculty,
    deleteFaculty,
};