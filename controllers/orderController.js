const Product = require("../models/productModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorhander");
const responseData = require("../utils/responseData");
const Order = require("../models/order");

// Tạo đơn hàng
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;
  const orderSystem = await Order.create(req.body);
  responseData(orderSystem, 201, "Order created successfully", res);
});

// Lấy tất cả đơn hàng
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const { page = 0, size = 10 } = req.body;

  // Tính toán phân trang
  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  // Lấy danh sách đơn hàng với phân trang
  const orders = await Order.find()
    .skip(skip)
    .limit(limit)
    .populate("user", "name email")
    .populate("orderItems.product", "name price");

  // Đếm tổng số đơn hàng
  const total = await Order.countDocuments();

  // Trả về dữ liệu và thông tin phân trang
  const result = {
    orders,
    pagination: {
      total,
      page: parseInt(page),
      size: parseInt(size),
    },
  };

  responseData(result, 200, null, res);
});

// Thay đổi trạng thái đơn hàng
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findById(id);

  if (!order) {
    return next(new ErrorHander("Order not found", 404));
  }

  if (order.orderStatus === "Successful delivery") {
    return next(new ErrorHander("Order has been successful delivery", 400));
  }

  if (status === "Delivering") {
    for (const item of order.orderItems) {
      await updateStock(item.product, item.quantity);
    }
  }

  order.orderStatus = status;

  if (status === "Successful delivery") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  responseData(order, 200, "Update order status successfully", res);
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  if (!product) {
    throw new ErrorHander("No products found", 404);
  }

  product.Stock -= quantity;

  if (product.Stock < 0) {
    throw new ErrorHander("Product quantity is not enough", 400);
  }

  await product.save({ validateBeforeSave: false });
}
