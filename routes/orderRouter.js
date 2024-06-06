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
  getOrdersWithAdminCustomer,
  getAllOrdersExcludingAdmin,
  getSuccessfulDeliveryOrders,
  getSuccessfulDeliveryOrdersBySeller,
  createUserOrder,
  createOrderForAgency,
  updateOrderStatusForAgency,
  getOrdersWithAgencyCustomer,
} = require("../controllers/orderController");
const router = express.Router();
router
  .route("/admin/order/create")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createOrder);

router
  .route("/agency/order/create")
  .post(isAuthenticatedUser, authorizeRoles("agency"), createOrderByAgency);

// router
//   .route("/admin/order/all")
//   .post(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

router
  .route("/admin/order/all")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    getAllOrdersExcludingAdmin
  );

router
  .route("/admin/order/admin-customers")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    getOrdersWithAdminCustomer
  );
router
  .route("/agency/order/all")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "agency"),
    getOrdersByAgency
  );

router
  .route("/agency/order/success")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "agency"),
    getSuccessfulDeliveryOrdersBySeller
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

router
  .route("/customer/order/create")
  .post(isAuthenticatedUser, createUserOrder);

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

router
  .route("/agency/order/to-house")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "agency"),
    createOrderForAgency
  );

router
  .route("/admin/order/status-agency/:id")
  .put(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    updateOrderStatusForAgency
  );

router
  .route("/admin/order/get-orders-with-agency-customer")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    getOrdersWithAgencyCustomer
  );

module.exports = router;
