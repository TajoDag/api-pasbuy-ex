const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createProductType,
  getAllProductType,
  updateProductType,
  deleteProductType,
} = require("../controllers/productTypeController");

const router = express.Router();
/**
 * @swagger
 * /admin/product-type/create:
 *   post:
 *     summary: Tạo loại sản phẩm mới
 *     tags: [Product Type]
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
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tạo loại sản phẩm mới thành công
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /admin/product-type/all:
 *   get:
 *     summary: Lấy tất cả loại sản phẩm
 *     tags: [Product Type]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /admin/product-type/edit/{id}:
 *   put:
 *     summary: Chỉnh sửa loại sản phẩm
 *     tags: [Product Type]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Chỉnh sửa thành công
 *       404:
 *         description: Không tìm thấy loại sản phẩm
 */

/**
 * @swagger
 * /admin/product-type/delete/{id}:
 *   delete:
 *     summary: Xóa loại sản phẩm
 *     tags: [Product Type]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xoá dữ liệu thành công
 *       404:
 *         description: Không tìm thấy loại sản phẩm
 */
router
  .route("/admin/product-type/create")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Super Admin"), createProductType);

router
  .route("/admin/product-type/all")
  .get(isAuthenticatedUser, authorizeRoles("admin", "Super Admin"), getAllProductType);

router
  .route("/admin/product-type/edit/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin", "Super Admin"), updateProductType);

router
  .route("/admin/product-type/delete/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin", "Super Admin"), deleteProductType);
module.exports = router;
