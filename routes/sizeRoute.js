const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createSize,
  getAllSize,
  updateSize,
  deleteSize,
} = require("../controllers/sizeController");

const router = express.Router();

router
  .route("/admin/size/create")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createSize);

router
  .route("/admin/size/all")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllSize);

router
  .route("/admin/size/edit/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateSize);

router
  .route("/admin/size/delete/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteSize);
module.exports = router;
