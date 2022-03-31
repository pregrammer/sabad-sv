const express = require("express");
const router = express.Router();
const {
  get_all,
  create_college,
  update_college,
  delete_college,
} = require("../controllers/collegesController");
const { isAdmin } = require("../middlewares/authMiddlewares");

router.get("/", isAdmin, get_all);
router.post("/", isAdmin, create_college);
router.put("/", isAdmin, update_college);
router.delete("/", isAdmin, delete_college);

module.exports = router;
