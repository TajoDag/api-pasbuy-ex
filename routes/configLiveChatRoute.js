const express = require("express");
const {
  getDetailConfigLiveChat,
  updateConfigLiveChat,
  createConfigLiveChat,
} = require("../controllers/configLiveChatController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const { getAccessToken } = require("../controllers/liveChatController");

const router = express.Router();

router.route("/configLiveChat/:id").get(getDetailConfigLiveChat);

router
  .route("/admin/configLiveChat/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateConfigLiveChat);

router
  .route("/admin/configLiveChat")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createConfigLiveChat);

router
  .route("/admin/livechat/token")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAccessToken);

module.exports = router;
