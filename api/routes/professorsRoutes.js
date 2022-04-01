const express = require("express");
const router = express.Router();
const {
  get_all_by_filter,
  create_professor,
  update_professor,
  delete_professor,
} = require("../controllers/professorsController");
const { isAdmin } = require("../middlewares/authMiddlewares");

router.get("/", get_all_by_filter);
router.post("/", isAdmin, create_professor);
router.put("/", isAdmin, update_professor);
router.delete("/", isAdmin, delete_professor);

module.exports = router;
