const express = require("express");
const router = express.Router();
const {
  get_all_by_filter,
  create_schedule,
  email_schedule,
  update_schedule,
  delete_schedule,
} = require("../controllers/schedulesController");
const { isSgm, isSgm_or_Ggm } = require("../middlewares/authMiddlewares");

router.get("/", get_all_by_filter);
router.post("/", isSgm, create_schedule);
router.post("/send-email", isSgm_or_Ggm, email_schedule);
router.put("/", isSgm_or_Ggm, update_schedule);
router.delete("/", isSgm, delete_schedule);

module.exports = router;
