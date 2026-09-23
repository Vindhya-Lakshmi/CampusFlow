const express = require("express");

const {
  getStudentGrades,
} = require("../controllers/grade.controller");

const router = express.Router();

router.get("/student/:studentId", getStudentGrades);

module.exports = router;