const express = require("express");
const router = express.Router();
const {
  get_others_messages,
  get_my_saved_messages,
  get_my_sent_messages,
  get_unseen_messages_count,
  create_message,
  update_message,
  delete_message,
} = require("../controllers/messagesController");

router.get("/others", get_others_messages);
router.get("/saved", get_my_saved_messages);
router.get("/sent", get_my_sent_messages);
router.get("/unseen-count", get_unseen_messages_count);
router.post("/", create_message);
router.put("/", update_message);
router.delete("/", delete_message);

module.exports = router;
