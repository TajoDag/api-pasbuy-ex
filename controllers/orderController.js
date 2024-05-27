const Product = require("../models/productModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorhander");
const responseData = require("../utils/responseData");
const Order = require("../models/order");
const Agency = require("../models/agencyModel");
const User = require("../models/userModel");

// Tạo đơn hàng và Agency
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;
  const { customer, orderItems, orderStatus } = req.body;

  // Tìm user theo ID của customer và cập nhật giá trị isShop
  const customerUser = await User.findById(customer);

  if (!customerUser) {
    return next(new ErrorHander("Customer not found", 404));
  }

  customerUser.isShop = true;
  customerUser.role = "agency";
  await customerUser.save();

  // Tạo đơn hàng
  const orderSystem = await Order.create(req.body);

  // Tạo hoặc cập nhật Agency
  let agency = await Agency.findOne({ homeAgents: customer });

  if (!agency) {
    agency = await Agency.create({
      homeAgents: customer,
      products: [],
    });
  }

  if (orderStatus === "Successful delivery") {
    for (const item of orderItems) {
      const agencyProduct = agency.products.find((p) =>
        p.product.equals(item.product)
      );
      if (agencyProduct) {
        agencyProduct.quantity += item.quantity;
      } else {
        agency.products.push({
          product: item.product,
          quantity: item.quantity,
        });
      }
    }
    await agency.save();
  }

  responseData(
    { order: orderSystem, agency: agency },
    201,
    "Order and Agency created successfully",
    res
  );
});

// Tạo đơn hàng bởi Agency
exports.createOrderByAgency = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;
  const { customer, orderItems } = req.body;

  // Tìm user theo ID của customer
  const customerUser = await User.findById(customer);

  if (!customerUser) {
    return next(new ErrorHander("Customer not found", 404));
  }

  // Tìm Agency của customer
  const agency = await Agency.findOne({ homeAgents: customer });

  if (!agency) {
    return next(new ErrorHander("Agency not found", 404));
  }

  // Kiểm tra và cập nhật kho của Agency
  for (const item of orderItems) {
    const agencyProduct = agency.products.find((p) =>
      p.product.equals(item.product)
    );
    if (!agencyProduct) {
      return next(
        new ErrorHander(`Product not found in agency's inventory`, 404)
      );
    }

    if (agencyProduct.quantity < item.quantity) {
      return next(
        new ErrorHander(
          "Product quantity is not enough in agency's inventory",
          400
        )
      );
    }

    agencyProduct.quantity -= item.quantity;
  }

  await agency.save();

  // Tạo đơn hàng
  const orderSystem = await Order.create(req.body);

  responseData(orderSystem, 201, "Order created successfully", res);
});

// Lấy tất cả đơn hàng của bạn
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
    .populate("orderItems.product", "name price")
    .populate("customer", "name email");

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

// Lấy danh sách đơn hàng của Agency no page
exports.getOrdersByAgencyNotPage = catchAsyncErrors(async (req, res, next) => {
  const { agencyId } = req.params;

  // Tạo điều kiện truy vấn
  const query = {
    customer: agencyId,
    orderStatus: { $ne: "Successful delivery" },
  };

  const orders = await Order.find(query)
    .populate("user", "name email")
    .populate("orderItems.product", "name price")
    .populate("customer", "name email");

  // Đếm tổng số đơn hàng của Agency
  const total = await Order.countDocuments(query);

  // Trả về dữ liệu và thông tin phân trang
  const result = {
    orders,
    pagination: {
      total,
    },
  };

  responseData(result, 200, null, res);
});

exports.getOrdersByAgency = catchAsyncErrors(async (req, res, next) => {
  const { agencyId } = req.params;
  const { page = 0, size = 10 } = req.body;

  // Tính toán phân trang
  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  // Lấy danh sách đơn hàng theo agencyId với phân trang
  const orders = await Order.find({ customer: agencyId })
    .skip(skip)
    .limit(limit)
    .populate("user", "name email")
    .populate("orderItems.product", "name price")
    .populate("customer", "name email");

  // Đếm tổng số đơn hàng của Agency
  const total = await Order.countDocuments({ customer: agencyId });

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

// Lấy danh sách đơn hàng của Customer
exports.getOrdersByCustomer = catchAsyncErrors(async (req, res, next) => {
  const { customerId } = req.params;
  const { page = 0, size = 10, orderStatus } = req.body;

  // Tính toán phân trang
  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  // Tạo điều kiện truy vấn
  const query = { customer: customerId };
  if (orderStatus) {
    query.orderStatus = orderStatus;
  }

  // Lấy danh sách đơn hàng theo customerId và status với phân trang
  const orders = await Order.find(query)
    .skip(skip)
    .limit(limit)
    .populate("user", "name email")
    .populate("orderItems.product", "name price")
    .populate("customer", "name email");

  // Đếm tổng số đơn hàng của khách hàng
  const total = await Order.countDocuments(query);

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

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status, orderLocation } = req.body;

  const order = await Order.findById(id);

  if (!order) {
    return next(new ErrorHander("Order not found", 404));
  }

  if (order.orderStatus === "Successful delivery") {
    return next(new ErrorHander("Order has been successful delivery", 400));
  }

  // Nếu trạng thái là "Delivering", cập nhật kho sản phẩm
  if (status === "Delivering") {
    for (const item of order.orderItems) {
      await updateStock(item.product, item.quantity);
    }
  }

  // Nếu trạng thái là "Successful delivery", chuyển sản phẩm sang Agency
  if (status === "Successful delivery") {
    const agency = await Agency.findOne({ homeAgents: order.customer });

    if (!agency) {
      return next(new ErrorHander("Agency not found", 404));
    }

    for (const item of order.orderItems) {
      const agencyProduct = agency.products.find((p) =>
        p.product.equals(item.product)
      );

      if (agencyProduct) {
        agencyProduct.quantity += item.quantity;
      } else {
        agency.products.push({
          product: item.product,
          quantity: item.quantity,
        });
      }
    }

    await agency.save();
    order.deliveredAt = Date.now();
  }

  order.orderStatus = status;

  if (orderLocation) {
    order.orderLocation = orderLocation;
  }

  await order.save({ validateBeforeSave: false });
  responseData(
    order,
    200,
    "Update order status and location successfully",
    res
  );
});

// Cập nhật kho sản phẩm
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

// Cập nhật trạng thái đơn hàng của Agency
exports.updateAgencyOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status, orderLocation } = req.body;

  const order = await Order.findById(id);

  if (!order) {
    return next(new ErrorHander("Order not found", 404));
  }

  if (order.orderStatus === "Successful delivery") {
    return next(new ErrorHander("Order has been successful delivery", 400));
  }

  // Cập nhật kho của Agency khi trạng thái là "Delivering"
  if (status === "Delivering") {
    const agency = await Agency.findOne({ homeAgents: order.customer });

    if (!agency) {
      return next(new ErrorHander("Agency not found", 404));
    }

    for (const item of order.orderItems) {
      const agencyProduct = agency.products.find((p) =>
        p.product.equals(item.product)
      );
      if (!agencyProduct) {
        return next(
          new ErrorHander(`Product not found in agency's inventory`, 404)
        );
      }

      if (agencyProduct.quantity < item.quantity) {
        return next(
          new ErrorHander(
            "Product quantity is not enough in agency's inventory",
            400
          )
        );
      }

      agencyProduct.quantity -= item.quantity;
    }

    await agency.save();
  }

  order.orderStatus = status;

  if (orderLocation) {
    order.orderLocation = orderLocation;
  }

  if (status === "Successful delivery") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  responseData(
    order,
    200,
    "Update agency order status and location successfully",
    res
  );
});
