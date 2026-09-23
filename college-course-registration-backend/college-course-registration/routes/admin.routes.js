const express = require("express");

const {
    getAdminStats,
    getAllStudents,
    getStudentRegistrations,
    getAllCourses,
    getAllFaculty,
    addCourse,
    updateCourse,
    deleteCourse,
    addFaculty,
    updateFaculty,
    deleteFaculty,
} = require("../controllers/admin.controller");

const {
    authMiddleware,
    requireAdmin,
} = require("../middleware/auth.middleware");

const router = express.Router();

// Protect all admin routes
router.use(authMiddleware);
router.use(requireAdmin);

router.get("/stats", getAdminStats);

router.get("/courses", getAllCourses);

router.post("/courses", addCourse);

router.put("/courses/:courseId", updateCourse);

router.delete("/courses/:courseId", deleteCourse);

router.get("/faculty", getAllFaculty);

router.post("/faculty", addFaculty);

router.put("/faculty/:facultyId", updateFaculty);

router.delete("/faculty/:facultyId", deleteFaculty);

router.get("/students", getAllStudents);

router.get(
    "/students/:studentId/registrations",
    getStudentRegistrations
);

module.exports = router;