const express = require("express");
const { protect } = require("../middleware/authmiddle");
const { fetchchat, accesschat, creategroup, renamegroup, removegroup, addgroup } = require("../controls/chatcrt");
const router = express.Router();

router.route("/access").post(protect, accesschat);
router.route("/fetch").get(protect, fetchchat);
router.route("/group").post(protect, creategroup);
router.route("/rename").put(protect, renamegroup);
router.route("/groupremove").put(protect, removegroup);
router.route("/groupadd").put(protect, addgroup);


module.exports = router