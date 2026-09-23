const express = require("express");

const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/auth.controller");

const {
  authMiddleware,
} = require("../middleware/auth.middleware");

console.log("AUTH ROUTE DEBUG:", {
  register: typeof register,
  login: typeof login,
  getCurrentUser: typeof getCurrentUser,
  authMiddleware: typeof authMiddleware,
});

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;