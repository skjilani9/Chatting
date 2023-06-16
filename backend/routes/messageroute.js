const express = require("express");
const { protect } = require("../middleware/authmiddle");
const { sendmessage, allmessages } = require("../controls/messagectr");
const router = express.Router();


router.route("/sendmessage").post(protect,sendmessage)
router.route("/allmessage/:chatId").get(protect,allmessages)

module.exports = router