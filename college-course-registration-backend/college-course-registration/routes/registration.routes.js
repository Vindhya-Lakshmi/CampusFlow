const express = require("express");
const router = express.Router();
const {
  getAllRegistrations,
  createRegistration,
  updateRegistrationStatus,
  deleteRegistration,
  getStudentCourseRelationship,
  getCourseWiseStudentList,
  getStudentCourses,
  getRegistrationStats,
} = require("../controllers/registration.controller");

// Core CRUD
router.get("/", getAllRegistrations);
router.post("/", createRegistration);
router.put("/:id/status", updateRegistrationStatus);
router.delete("/:id", deleteRegistration);

// Reporting / relational endpoints — these showcase the JOIN queries
router.get("/report/student-course", getStudentCourseRelationship);
router.get("/report/course-wise", getCourseWiseStudentList);
router.get("/report/stats", getRegistrationStats);
router.get("/student/:studentId", getStudentCourses);

module.exports = router;
