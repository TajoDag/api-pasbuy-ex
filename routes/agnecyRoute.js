const express = require("express");
const {
  getAgencyByHomeAgentId,
  updateProductPriceInAgency,
} = require("../controllers/agencyController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/agency/homeAgent/:homeAgentId",
  isAuthenticatedUser,
  authorizeRoles("agency", "Super Admin"),
  getAgencyByHomeAgentId
);

router
  .route("/agency/product/update")
  .put(
    isAuthenticatedUser,
    authorizeRoles("agency", "Super Admin"),
    updateProductPriceInAgency
  );

module.exports = router;
