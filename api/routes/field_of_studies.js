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
router.put("/", update_fos);
router.delete("/", delete_fos);

module.exports = router;


//router.get("/:fos_id", update_fos);  req.params.fos_id

//const checkAuth = require('../middleware/check-auth');
//router.get("/", checkAuth, OrdersController.orders_get_all);
