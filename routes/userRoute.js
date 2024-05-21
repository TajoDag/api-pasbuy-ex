const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser,
  findAllUsers,
} = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: User
 *   description: Danh sách api của User
 */

/**
 * @swagger
 * /register:
 *   post:
 *     tags: [User]
 *     summary: Đăng ký tài khoản
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Người dùng đã được đăng ký thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                    type: object
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       500:
 *         description: Lỗi server.
 */
router.route("/register").post(registerUser);

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [User]
 *     summary: Đăng nhập
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                  type: string
 *                  format: password
 *     responses:
 *       200:
 *         description: Người dùng đã Đăng nhập thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       500:
 *         description: Lỗi server.
 */
router.route("/login").post(loginUser);

// router.route("/password/forgot").post(forgotPassword);

// router.route("/password/reset/:token").put(resetPassword);

/**
 * @swagger
 * /logout:
 *   get:
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     summary: Đăng xuất
 *     responses:
 *       200:
 *         description: Người dùng đã Đăng xuất thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       500:
 *         description: Lỗi server.
 */
router.route("/logout").get(logout);

/**
 * @swagger
 * /me:
 *   get:
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     summary: Chi tiết tài khoản đang sử dụng
 *     responses:
 *       200:
 *         description:  Chi tiết tài khoản đang sử dụng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                    type: object
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       500:
 *         description: Lỗi server.
 */
router.route("/me").get(isAuthenticatedUser, getUserDetails);

/**
 * @swagger
 * /password/update:
 *   put:
 *     tags: [User]
 *     summary: Đổi mật khẩu tài khoản
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       500:
 *         description: Lỗi server.
 */
router.route("/password/update").put(isAuthenticatedUser, updatePassword);

/**
 * @swagger
 * /me/update:
 *   put:
 *     tags: [User]
 *     summary: Đổi thông tin tài khoản
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đổi thông tin thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       500:
 *         description: Lỗi server.
 */
router.route("/me/update").put(isAuthenticatedUser, updateProfile);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [User]
 *     summary: Danh sách tài khoản
 *     description: Lấy danh sách tài khoản ( Chỉ có admin mới có thể sử dụng )
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tài khoản.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       403:
 *         description: Không có quyền truy cập.
 *       500:
 *         description: Lỗi server.
 */
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);

/**
 * @swagger
 * /admin/user/:id:
 *   get:
 *     tags: [User]
 *     summary: Thông tin chi tiết một tài khoản
 *     description: Thông tin chi tiết một tài khoản ( Chỉ có admin mới có thể sử dụng )
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tài khoản cần lấy thông tin
 *     responses:
 *       200:
 *         description: Thông tin chi tiết một tài khoản.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       403:
 *         description: Không có quyền truy cập.
 *       500:
 *         description: Lỗi server.
 */

/**
 * @swagger
 * /admin/user/:id:
 *   put:
 *     tags: [User]
 *     summary: Chỉnh sửa một tài khoản
 *     description: Chỉnh sửa một tài khoản ( Chỉ có admin mới có thể sử dụng )
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tài khoản cần lấy thông tin
 *     responses:
 *       200:
 *         description: Đổi thông tin thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       403:
 *         description: Không có quyền truy cập.
 *       500:
 *         description: Lỗi server.
 */

/**
 * @swagger
 * /admin/user/:id:
 *   delete:
 *     tags: [User]
 *     summary: Xóa một tài khoản
 *     description: Xóa một tài khoản ( Chỉ có admin mới có thể sử dụng )
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tài khoản cần lấy thông tin
 *     responses:
 *       200:
 *         description: Xóa thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       403:
 *         description: Không có quyền truy cập.
 *       500:
 *         description: Lỗi server.
 */
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

  router
  .route("/admin/findAllUsers")
  .post(isAuthenticatedUser, authorizeRoles("admin"), findAllUsers);

module.exports = router;
