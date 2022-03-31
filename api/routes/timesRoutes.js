const express = require("express");
const router = express.Router();
const {
  get_all,
  create_time,
  update_time,
  delete_time,
} = require("../controllers/timesController");
const { isAdmin } = require("../middlewares/authMiddlewares");

router.get("/", isAdmin, get_all);
router.post("/", isAdmin, create_time);
router.put("/", isAdmin, update_time);
router.delete("/", isAdmin, delete_time);

module.exports = router;
