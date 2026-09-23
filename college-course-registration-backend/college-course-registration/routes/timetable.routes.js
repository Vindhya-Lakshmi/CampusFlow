const express = require("express");

const {
  getStudentTimetable,
} = require("../controllers/timetable.controller");

const router = express.Router();

router.get("/student/:studentId", getStudentTimetable);

module.exports = router;