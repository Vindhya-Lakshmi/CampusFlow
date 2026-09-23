const express = require("express");

const {
  getStudentNotifications,
  markNotificationAsRead,
  createNotification,
  getAllNotifications,
} = require("../controllers/notification.controller");

const router = express.Router();

router.get("/student/:studentId", getStudentNotifications);

router.get("/admin/all", getAllNotifications);

router.post("/", createNotification);

router.put("/:id/read", markNotificationAsRead);

module.exports = router;