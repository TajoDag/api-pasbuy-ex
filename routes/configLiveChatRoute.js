const express = require("express");
const {
  getDetailConfigLiveChat,
  updateConfigLiveChat,
  createConfigLiveChat,
} = require("../controllers/configLiveChatController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();


router
  .route("/admin/configLiveChat/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getDetailConfigLiveChat);

  router
  .route("/admin/configLiveChat/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateConfigLiveChat);

  router
  .route("/admin/configLiveChat")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createConfigLiveChat);


module.exports = router;
