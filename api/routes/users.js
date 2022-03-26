const express = require("express");
const router = express.Router();
const {
    get_all,
    create_user,
    update_user,
    delete_user
} = require('../controllers/users');


router.get('/', get_all);
router.post('/', create_user);
router.put('/:user_id', update_user);
router.delete('/:user_id', delete_user);

module.exports = router;



//const checkAuth = require('../middleware/check-auth');
//router.get("/", checkAuth, OrdersController.orders_get_all);