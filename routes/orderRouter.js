const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createOrder,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const router = express.Router();
router
  .route("/admin/order/create")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createOrder);

router.route("/order/all").post(getAllOrders);
router
  .route("/admin/order/status/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrderStatus);

module.exports = router;
