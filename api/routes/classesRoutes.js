const express = require("express");
const router = express.Router();
const {
  get_all,
  get_all_by_filter,
  create_class,
  update_class,
  delete_class,
} = require("../controllers/classesController");
const { isAdmin } = require("../middlewares/authMiddlewares");

router.get("/", get_all);
router.get("/filter", get_all_by_filter);
router.post("/", isAdmin, create_class);
router.put("/", isAdmin, update_class);
router.delete("/", isAdmin, delete_class);

module.exports = router;
