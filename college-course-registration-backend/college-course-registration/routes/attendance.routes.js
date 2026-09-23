const express = require("express");

const {
  getStudentAttendance,
} = require("../controllers/attendance.controller");

const router = express.Router();

router.get("/student/:studentId", getStudentAttendance);

module.exports = router;