const express = require("express");
const router = express.Router();
const {
    get_all,
    create_user,
    update_user,
    delete_user
} = require('../controllers/usersController');
const { isAdmin, isAdmin_or_Self_updating } = require("../middlewares/authMiddlewares");


router.get('/', isAdmin, get_all);
router.post('/', isAdmin, create_user);
router.put('/', isAdmin_or_Self_updating, update_user);
router.delete('/', isAdmin, delete_user);

module.exports = router;



//const checkAuth = require('../middleware/check-auth');
//router.get("/", checkAuth, OrdersController.orders_get_all);