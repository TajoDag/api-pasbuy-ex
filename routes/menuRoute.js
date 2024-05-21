const express = require("express");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createMenu,
  getAllMenu,
  updateMenu,
  deleteMenu,
} = require("../controllers/menuController");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: Danh sách api của Menu
 */

/**
 * @swagger
 * /menu/create:
 *   post:
 *     tags: [Menu]
 *     summary: Thêm mới menu
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
 *               - path
 *               - icon
 *               - isChildren
 *               - children
 *               - status
 *               - isShow
 *             properties:
 *               name:
 *                 type: string
 *               path:
 *                 type: string
 *               icon:
 *                 type: string
 *               status:
 *                 type: boolean
 *               isShow:
 *                 type: boolean
 *               isChildren:
 *                 type: boolean
 *                 default: false
 *               children:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - path
 *                     - icon
 *                     - status
 *                     - isShow
 *                   properties:
 *                     name:
 *                       type: string
 *                     path:
 *                       type: string
 *                     icon:
 *                       type: string
 *                     status:
 *                       type: boolean
 *                     isShow:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Tạo menu mới thành công.
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

router
  .route("/admin/menu/create")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createMenu);

/**
 * @swagger
 * /admin/menu/all:
 *   get:
 *     tags: [Menu]
 *     summary: Danh sách menu
 *     description: Lấy danh sách menu ( Chỉ có admin mới có thể sử dụng )
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách menu.
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

router.route("/admin/menu/all").get(isAuthenticatedUser, authorizeRoles("admin"),getAllMenu);

/**
 * @swagger
 * /admin/menu/all:
 *   get:
 *     tags: [Menu]
 *     summary: Danh sách menu
 *     description: Lấy danh sách menu
 *     responses:
 *       200:
 *         description: Danh sách menu.
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
router.route("/menu/all").get(getAllMenu);

/**
 * @swagger
 * /admin/menu/edit/:id:
 *   put:
 *     tags: [Menu]
 *     summary: Chỉnh sửa menu
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tài khoản cần lấy thông tin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - path
 *               - isChildren
 *               - icon
 *               - children
 *               - status
 *               - isShow
 *             properties:
 *               name:
 *                 type: string
 *               path:
 *                 type: string
 *               icon:
 *                 type: string
 *               status:
 *                 type: boolean
 *               isShow:
 *                 type: boolean
 *               isChildren:
 *                 type: boolean
 *                 default: false
 *               children:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - path
 *                     - icon
 *                     - status
 *                     - isShow
 *                   properties:
 *                     name:
 *                       type: string
 *                     path:
 *                       type: string
 *                     icon:
 *                       type: string
 *                     status:
 *                       type: boolean
 *                     isShow:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Chỉnh sửa menu thành công.
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

router
  .route("/admin/menu/edit/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateMenu);

/**
 * @swagger
 * /admin/menu/delete/:id:
 *   delete:
 *     tags: [Menu]
 *     summary: Xóa một menu
 *     description: Xóa một menu ( Chỉ có admin mới có thể sử dụng )
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
  .route("/admin/menu/delete/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteMenu);
module.exports = router;
