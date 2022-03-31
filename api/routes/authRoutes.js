const express = require("express");
const router = express.Router();
const { login, logout } = require("../controllers/authController");
const { requireAuth } = require("../middlewares/authMiddlewares");

router.post("/login", login);
router.get("/logout", requireAuth, logout);

module.exports = router;
