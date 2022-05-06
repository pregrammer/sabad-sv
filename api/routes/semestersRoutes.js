const express = require("express");
const router = express.Router();
const {
  get_all,
  get_last_testDates,
  create_semester,
  update_semester,
  delete_semester,
} = require("../controllers/semestersController");
const { isAdmin } = require("../middlewares/authMiddlewares");

router.get("/", get_all);
router.get("/last-test-dates", get_last_testDates);
router.post("/", isAdmin, create_semester);
router.put("/", isAdmin, update_semester);
router.delete("/", isAdmin, delete_semester);

module.exports = router;
