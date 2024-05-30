const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createBanner,
  updateBanner,
  getBanners,
  getBannerDetail,
} = require("../controllers/bannerController");

const router = express.Router();

router
  .route("/admin/banner/create")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createBanner);

router
  .route("/admin/banner/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateBanner);
router.route("/banner/:id").get(getBannerDetail);
router.get("/banners", getBanners);

module.exports = router;
