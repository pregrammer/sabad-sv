const express = require("express");
const router = express.Router();
const {
  get_weekly_schedules_by_filter,
  get_test_schedules_by_filter,
  get_schedule,
  get_class_freeTimes,
  create_schedule,
  email_schedule,
  update_schedule,
  update_schedule_state,
  delete_schedule,
} = require("../controllers/schedulesController");
const { isSgm, isSgm_or_Ggm } = require("../middlewares/authMiddlewares");

router.get("/weekly", get_weekly_schedules_by_filter);
router.get("/test", get_test_schedules_by_filter);
router.get("/schedule", get_schedule);
router.get("/class-free-times", get_class_freeTimes);

router.post("/", isSgm, create_schedule);
router.post("/send-email", isSgm_or_Ggm, email_schedule);

router.put("/", isSgm_or_Ggm, update_schedule);
router.put("/change-state", isSgm, update_schedule_state);

router.delete("/", isSgm, delete_schedule);

module.exports = router;
