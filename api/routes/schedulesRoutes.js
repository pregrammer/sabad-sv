const express = require("express");
const router = express.Router();
const {
  get_all,
  get_weekly_schedules_by_filter,
  get_test_schedules_by_filter,
  get_schedule,
  create_schedule,
  email_weekly_schedule,
  email_test_schedule,
  get_class_schedules,
  update_schedule,
  update_schedule_state,
  delete_schedule,
} = require("../controllers/schedulesController");
const { isSgm, isSgm_or_Ggm } = require("../middlewares/authMiddlewares");

router.get("/", isSgm_or_Ggm, get_all);
router.get("/weekly", get_weekly_schedules_by_filter);
router.get("/test", get_test_schedules_by_filter);
router.get("/schedule", get_schedule);
router.get("/class-schedules", get_class_schedules);

router.post("/", isSgm, create_schedule);
router.post("/weekly-email", isSgm_or_Ggm, email_weekly_schedule);
router.post("/test-email", isSgm_or_Ggm, email_test_schedule);

router.put("/", isSgm_or_Ggm, update_schedule);
router.put("/change-state", isSgm_or_Ggm, update_schedule_state);

router.delete("/", isSgm, delete_schedule);

module.exports = router;
