const express = require("express");
const router = express.Router();
const {
  get_all,
  create_fos,
  update_fos,
  delete_fos,
} = require("../controllers/field_of_studies");
// fos = field of study

router.get("/", get_all);
router.post("/", create_fos);
router.put("/:fos_id", update_fos);
router.delete("/:fos_id", delete_fos);

module.exports = router;

//const checkAuth = require('../middleware/check-auth');
//router.get("/", checkAuth, OrdersController.orders_get_all);
