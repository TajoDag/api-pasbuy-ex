const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  createBrand,
  updateBrand,
  deleteBrand,
  getAllBrand,
} = require("../controllers/brandController");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Brand
 *   description: API to manage brands
 */

/**
 * @swagger
 * /admin/brand/create:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brand]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - phone
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Brand created successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /admin/brand/all:
 *   get:
 *     summary: Get all brands
 *     tags: [Brand]
 *     responses:
 *       200:
 *         description: List of brands
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Brand'
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /admin/brand/edit/{id}:
 *   put:
 *     summary: Update a brand
 *     tags: [Brand]
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
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *       404:
 *         description: Brand not found
 */

/**
 * @swagger
 * /admin/brand/delete/{id}:
 *   delete:
 *     summary: Delete a brand
 *     tags: [Brand]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *       404:
 *         description: Brand not found
 */
router
  .route("/admin/brand/create")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createBrand);

router
  .route("/admin/brand/all")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllBrand);
  router
  .route("/brand/all")
  .get( getAllBrand);

router
  .route("/admin/brand/edit/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateBrand);

router
  .route("/admin/brand/delete/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteBrand);
module.exports = router;
