const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createOrder,
  getAllOrders,
  updateOrderStatus,
  createOrderByAgency,
  getOrdersByAgency,
  getOrdersByCustomer,
  updateAgencyOrderStatus,
  getOrdersByAgencyNotPage,
} = require("../controllers/orderController");
const router = express.Router();
router
  .route("/admin/order/create")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createOrder);

router
  .route("/agency/order/create")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "agency"),
    createOrderByAgency
  );

router
  .route("/admin/order/all")
  .post(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

router
  .route("/agency/order/all/:agencyId")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "agency"),
    getOrdersByAgency
  );

router
  .route("/customer/order/all/:customerId")
  .post(isAuthenticatedUser, getOrdersByCustomer);

router
  .route("/agency/orders/:agencyId")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "agency"),
    getOrdersByAgencyNotPage
  );

// router
//   .route("/customer/order/all/:customerId")
//   .post(isAuthenticatedUser, getOrdersByCustomer);

router
  .route("/admin/order/status/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrderStatus);

router
  .route("/agency/order/status/:id")
  .put(
    isAuthenticatedUser,
    authorizeRoles("admin", "agency"),
    updateAgencyOrderStatus
  );

module.exports = router;
