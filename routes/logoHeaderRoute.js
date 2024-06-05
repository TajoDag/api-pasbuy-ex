const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createLogoHeader,
  updateLogoHeader,
  getLogoHeaderDetail,
} = require("../controllers/logoHeaderController");

const router = express.Router();

router
  .route("/admin/logo/header")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createLogoHeader);

router
  .route("/admin/logo/header/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateLogoHeader);
router
  .route("/admin/logo/header/:id")
  .get(getLogoHeaderDetail);
module.exports = router;