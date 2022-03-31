const express = require("express");
const router = express.Router();
const {
  get_all,
  get_all_by_filter,
  create_course,
  update_course,
  delete_course,
} = require("../controllers/coursesController");
const { isSgm } = require("../middlewares/authMiddlewares");

router.get("/", get_all);
router.get("/filter", get_all_by_filter);
router.post("/", isSgm, create_course);
router.put("/", isSgm, update_course);
router.delete("/", isSgm, delete_course);

module.exports = router;
