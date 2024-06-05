const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createLogoFooter,
  updateLogoFooter,
  getLogoFooterDetail,
} = require("../controllers/logoFooterController");

const router = express.Router();

router
  .route("/admin/logo/footer")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createLogoFooter);

router
  .route("/admin/logo/footer/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateLogoFooter);
router.route("/logo/footer/:id").get(getLogoFooterDetail);
module.exports = router;