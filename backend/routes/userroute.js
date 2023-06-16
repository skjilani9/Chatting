const express = require("express");
const { registeruser, loginuser, allUsers } = require("../controls/userctr");
const { protect } = require("../middleware/authmiddle");
const router = express.Router();

router.route("/register").post(registeruser)
router.route("/login").post(loginuser)
router.route("/users").get(protect,allUsers)




module.exports = router