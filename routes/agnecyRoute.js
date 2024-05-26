const express = require("express");
const { getAgencyByHomeAgentId } = require("../controllers/agencyController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/agency/homeAgent/:homeAgentId",
  isAuthenticatedUser,
  authorizeRoles("agency"),
  getAgencyByHomeAgentId
);

module.exports = router;
