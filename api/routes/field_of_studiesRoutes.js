const express = require("express");
const router = express.Router();
const {
  get_all,
  create_fos,
  update_fos,
  delete_fos,
} = require("../controllers/field_of_studiesController");
const { isAdmin } = require("../middlewares/authMiddlewares");

// fos = field of study

router.get("/", get_all);
router.post("/", isAdmin, create_fos);
router.put("/", isAdmin, update_fos);
router.delete("/", isAdmin, delete_fos);

module.exports = router;

//router.get("/:fos_id", update_fos);  req.params.fos_id
