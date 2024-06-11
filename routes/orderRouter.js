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
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Super Admin"),
    createOrder
  );

router
  .route("/agency/order/create")
  .post(
    isAuthenticatedUser,
    authorizeRoles("agency", "Super Admin"),
    createOrderByAgency
  );

// router
//   .route("/admin/order/all")
//   .post(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

router
  .route("/admin/order/all")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Super Admin"),
    getAllOrdersExcludingAdmin
  );

router
  .route("/admin/order/admin-customers")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Super Admin"),
    getOrdersWithAdminCustomer
  );
router
  .route("/agency/order/all")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "agency", "Super Admin"),
    getOrdersByAgency
  );

router
  .route("/agency/order/success")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "agency", "Super Admin"),
    getSuccessfulDeliveryOrdersBySeller
  );

router
  .route("/customer/order/all/:customerId")
  .post(isAuthenticatedUser, getOrdersByCustomer);

router
  .route("/agency/orders/:agencyId")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "agency", "Super Admin"),
    getOrdersByAgencyNotPage
  );

router
  .route("/customer/order/create")
  .post(isAuthenticatedUser, createUserOrder);

router
  .route("/admin/order/status/:id")
  .put(
    isAuthenticatedUser,
    authorizeRoles("admin", "Super Admin"),
    updateOrderStatus
  );

router
  .route("/agency/order/status/:id")
  .put(
    isAuthenticatedUser,
    authorizeRoles("admin", "agency", "Super Admin"),
    updateAgencyOrderStatus
  );

router
  .route("/agency/order/to-house")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "agency", "Super Admin"),
    createOrderForAgency
  );

router
  .route("/admin/order/status-agency")
  .put(
    isAuthenticatedUser,
    authorizeRoles("admin", "Super Admin"),
    updateOrderStatusForAgency
  );

router
  .route("/admin/order/get-orders-with-agency-customer")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Super Admin"),
    getOrdersWithAgencyCustomer
  );

module.exports = router;
