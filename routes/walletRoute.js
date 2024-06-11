const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  requestWithdraw,
  depositMoney,
  confirmWithdraw,
  getWithdrawRequests,
  getDepositRequests,
  getWithdrawHistoryByCustomer,
  getDepositHistoryByCustomer,
} = require("../controllers/walletController");

const router = express.Router();

// Yêu cầu rút tiền
router.route("/user/wallet/request").post(isAuthenticatedUser, requestWithdraw);

// Xác nhận yêu cầu rút tiền
router
  .route("/admin/wallet/confirm/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin", "Super Admin"), confirmWithdraw);

// Nạp tiền cho khách hàng
router.route("/user/wallet/deposit").post(isAuthenticatedUser, depositMoney);

// Lấy danh sách yêu cầu rút tiền
router
  .route("/admin/wallet/withdraw-requests")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Super Admin"), getWithdrawRequests);

// Lấy danh sách nạp tiền
router
  .route("/admin/wallet/deposit-requests")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Super Admin"), getDepositRequests);

// Lấy lịch sử yêu cầu rút tiền theo ID khách hàng
router
  .route("/user/wallet/withdraw-history/:customerId")
  .get(isAuthenticatedUser, getWithdrawHistoryByCustomer);

// Lấy lịch sử nạp tiền theo ID khách hàng
router
  .route("/user/wallet/deposit-history/:customerId")
  .get(isAuthenticatedUser, getDepositHistoryByCustomer);

module.exports = router;
