const Product = require("../models/productModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorhander");
const responseData = require("../utils/responseData");
const Order = require("../models/order");
const Agency = require("../models/agencyModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

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

// create order by agency
exports.createOrderForAgency = catchAsyncErrors(async (req, res, next) => {
  // req.body.user = req.user.id;
  const { customer, orderItems, user } = req.body;

  // Tìm user theo ID của customer và cập nhật giá trị isShop
  const customerUser = await User.findById(customer);

  if (!customerUser) {
    return next(new ErrorHander("Customer not found", 404));
  }

  customerUser.isShop = true;
  customerUser.role = "agency";
  await customerUser.save();

  // Tạo đơn hàng
  const orderSystem = await Order.create({
    ...req.body,
    orderStatus: "Pending Payment",
  });

  // Tạo hoặc cập nhật Agency
  let agency = await Agency.findOne({ homeAgents: customer });

  if (!agency) {
    agency = await Agency.create({
      homeAgents: customer,
      products: [],
    });
  }

  // Thêm sản phẩm vào agency với số lượng là 0
  for (const item of orderItems) {
    const agencyProduct = agency.products.find((p) =>
      p.product.equals(item.product)
    );
    if (agencyProduct) {
      agencyProduct.quantity = 0;
    } else {
      agency.products.push({
        product: item.product,
        quantity: 0,
      });
    }
  }
  await agency.save();

  responseData(
    { order: orderSystem, agency: agency },
    201,
    "Order and Agency created successfully",
    res
  );
});

// update order Agency
exports.updateOrderStatusForAgency = catchAsyncErrors(
  async (req, res, next) => {
    const { orderId, orderStatus, orderItems } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new ErrorHander("Order not found", 404));
    }

    // Cập nhật trạng thái đơn hàng
    order.orderStatus = orderStatus;

    if (orderStatus === "Paid") {
      // Cập nhật số lượng sản phẩm trong agency
      const agency = await Agency.findOne({ homeAgents: order.customer });

      if (!agency) {
        return next(new ErrorHander("Agency not found", 404));
      }

      for (const item of orderItems) {
        const productId = new ObjectId(item.productId); // Sử dụng 'new' để khởi tạo ObjectId
        const agencyProduct = agency.products.find((p) =>
          p.product.equals(productId)
        );
        if (agencyProduct) {
          agencyProduct.quantity += item.quantity;
        } else {
          agency.products.push({
            product: productId, // Sử dụng ObjectId cho product
            quantity: item.quantity,
          });
        }

        // Cập nhật thông tin sản phẩm trong đơn hàng
        const orderProduct = order.orderItems.find((p) =>
          p.product.equals(productId)
        );
        if (orderProduct) {
          orderProduct.quantity = item.quantity;
          orderProduct.totalAmount = item.totalAmount;
        }
      }
      await agency.save();
    }

    await order.save();

    responseData(
      { order: order },
      200,
      "Order status and items updated successfully",
      res
    );
  }
);

// Tạo đơn hàng bởi Agency
exports.createOrderByAgency = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;
  const { customer, orderItems, homeAgentId } = req.body;

  // Tìm user theo ID của customer
  const customerUser = await User.findById(customer);

  if (!customerUser) {
    return next(new ErrorHander("Customer not found", 404));
  }

  // Tìm Agency của homeAgentId
  console.log("homeAgentId:", homeAgentId); // Log để kiểm tra giá trị homeAgentId
  const agency = await Agency.findOne({ homeAgents: homeAgentId });

  if (!agency) {
    console.log("Agency not found for homeAgentId:", homeAgentId); // Log khi không tìm thấy agency
    return next(new ErrorHander("Agency not found", 404));
  }

  // Tạo đơn hàng mà không cần kiểm tra và cập nhật kho của agency
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
    .sort({ createdAt: -1 })
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

exports.getAllOrdersExcludingAdmin = catchAsyncErrors(
  async (req, res, next) => {
    const { page = 0, size = 10, name = "", status = "" } = req.body;

    // Tính toán phân trang
    const limit = parseInt(size);
    const skip = parseInt(page) * limit;

    // Tạo điều kiện lọc
    let matchConditions = {
      "customerDetails.role": { $ne: "admin" },
    };

    if (name) {
      matchConditions["customerDetails.name"] = { $regex: name, $options: "i" };
    }

    if (status) {
      matchConditions["orderStatus"] = status;
    }

    // Sử dụng aggregate để lọc các đơn hàng có khách hàng không phải là "admin"
    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "customer",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: "$customerDetails",
      },
      {
        $match: matchConditions,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $project: {
          _id: 1,
          customer: "$customerDetails",
          name: 1,
          phone: 1,
          email: 1,
          address: 1,
          note: 1,
          orderItems: {
            name: 1,
            price: 1,
            quantity: 1,
            product: "$productDetails",
          },
          deliveredAt: 1,
          totalPrice: 1,
          orderStatus: 1,
          orderLocation: 1,
          user: "$userDetails",
          createdAt: 1,
        },
      },
    ]);

    // Đếm tổng số đơn hàng có khách hàng không phải là "admin"
    const total = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "customer",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: "$customerDetails",
      },
      {
        $match: matchConditions,
      },
      {
        $count: "totalCount",
      },
    ]);

    const totalOrders = total.length > 0 ? total[0].totalCount : 0;

    // Trả về dữ liệu và thông tin phân trang
    const result = {
      orders,
      pagination: {
        total: totalOrders,
        page: parseInt(page),
        size: parseInt(size),
      },
    };

    responseData(result, 200, null, res);
  }
);

exports.getOrdersWithAdminCustomer = catchAsyncErrors(
  async (req, res, next) => {
    const { page = 0, size = 10 } = req.body;

    // Tính toán phân trang
    const limit = parseInt(size);
    const skip = parseInt(page) * limit;

    // Sử dụng aggregate để lọc các đơn hàng có khách hàng là "admin"
    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "customer",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: "$customerDetails",
      },
      {
        $match: {
          "customerDetails.role": "admin",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $project: {
          _id: 1,
          customer: "$customerDetails",
          name: 1,
          phone: 1,
          email: 1,
          address: 1,
          note: 1,
          orderItems: {
            name: 1,
            price: 1,
            quantity: 1,
            product: "$productDetails",
          },
          deliveredAt: 1,
          totalPrice: 1,
          orderStatus: 1,
          orderLocation: 1,
          user: "$userDetails",
          createdAt: 1,
        },
      },
    ]);

    // Đếm tổng số đơn hàng có khách hàng là "admin"
    const total = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "customer",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: "$customerDetails",
      },
      {
        $match: {
          "customerDetails.role": "admin",
        },
      },
      {
        $count: "totalCount",
      },
    ]);

    const totalOrders = total.length > 0 ? total[0].totalCount : 0;

    // Trả về dữ liệu và thông tin phân trang
    const result = {
      orders,
      pagination: {
        total: totalOrders,
        page: parseInt(page),
        size: parseInt(size),
      },
    };

    responseData(result, 200, null, res);
  }
);
exports.getOrdersWithAgencyCustomer = catchAsyncErrors(
  async (req, res, next) => {
    const { page = 0, size = 10 } = req.body;

    // Tính toán phân trang
    const limit = parseInt(size);
    const skip = parseInt(page) * limit;

    // Sử dụng aggregate để lọc các đơn hàng có khách hàng là "agency"
    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "customer",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: "$customerDetails",
      },
      {
        $match: {
          "customerDetails.role": "agency",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $project: {
          _id: 1,
          customer: "$customerDetails",
          name: 1,
          phone: 1,
          email: 1,
          address: 1,
          note: 1,
          orderItems: {
            name: 1,
            price: 1,
            quantity: 1,
            product: "$productDetails",
          },
          deliveredAt: 1,
          totalPrice: 1,
          orderStatus: 1,
          orderLocation: 1,
          user: "$userDetails",
          createdAt: 1,
        },
      },
    ]);

    // Đếm tổng số đơn hàng có khách hàng là "agency"
    const total = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "customer",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: "$customerDetails",
      },
      {
        $match: {
          "customerDetails.role": "agency",
        },
      },
      {
        $count: "totalCount",
      },
    ]);

    const totalOrders = total.length > 0 ? total[0].totalCount : 0;

    // Trả về dữ liệu và thông tin phân trang
    const result = {
      orders,
      pagination: {
        total: totalOrders,
        page: parseInt(page),
        size: parseInt(size),
      },
    };

    responseData(result, 200, null, res);
  }
);

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
  const { page = 0, size = 10, userId, status } = req.body;

  // Tính toán phân trang
  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  // Tạo điều kiện truy vấn
  const query = {};
  if (userId) {
    query.user = userId;
  }
  if (status) {
    query.orderStatus = status;
  }

  // Lấy danh sách đơn hàng với phân trang
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("user", "name email")
    .populate("orderItems.product", "name price images")
    .populate("customer", "name email");

  // Đếm tổng số đơn hàng
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
    .sort({ createdAt: -1 })
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

// Cập nhật trạng thái đơn hàng của Agency
exports.updateAgencyOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status, orderLocation } = req.body;

  // Tìm đơn hàng
  const order = await Order.findById(id);

  if (!order) {
    return next(new ErrorHander("Order not found", 404));
  }

  if (order.orderStatus === "Successful delivery") {
    return next(new ErrorHander("Order has been successful delivery", 400));
  }

  // Cập nhật kho của Agency khi trạng thái là "Delivering"
  if (status === "Delivering") {
    const agency = await Agency.findOne({ homeAgents: order.user }); // Sử dụng 'order.user' để tìm Agency

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

  // Cập nhật trạng thái đơn hàng
  order.orderStatus = status;

  if (orderLocation) {
    order.orderLocation = orderLocation;
  }

  if (status === "Successful delivery") {
    order.deliveredAt = Date.now();

    // Tìm người bán
    const user = await User.findById(order.user);

    if (!user) {
      return next(new ErrorHander("User not found", 404));
    }

    // Tăng giá trị `point` của người bán bằng với tổng giá trị đơn hàng
    user.point += order.totalPrice; // Giả sử `totalPrice` là tổng giá trị đơn hàng

    await user.save();
  }

  await order.save({ validateBeforeSave: false });
  responseData(
    order,
    200,
    "Update agency order status and location successfully",
    res
  );
});
exports.getSuccessfulDeliveryOrdersBySeller = catchAsyncErrors(
  async (req, res, next) => {
    const { page = 0, size = 10, userId } = req.body;

    // Tính toán phân trang
    const limit = parseInt(size);
    const skip = parseInt(page) * limit;

    // Tạo điều kiện truy vấn
    const query = {
      orderStatus: "Successful delivery",
      user: userId,
    };

    // Lấy danh sách đơn hàng với phân trang
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .populate("orderItems.product", "name price")
      .populate("customer", "name email");

    // Đếm tổng số đơn hàng
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

    responseData(
      result,
      200,
      "Successful delivery orders fetched successfully",
      res
    );
  }
);

exports.createUserOrder = catchAsyncErrors(async (req, res, next) => {
  req.body.customer = req.user.id;

  const order = await Order.create(req.body);

  responseData(order, 201, "Order created successfully", res);
});

exports.getUserOrders = catchAsyncErrors(async (req, res, next) => {
  const { page = 0, size = 10 } = req.body;

  // Tính toán phân trang
  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  // Lấy danh sách đơn hàng với phân trang chỉ của người dùng hiện tại
  const orders = await Order.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("user", "name email")
    .populate("orderItems.product", "name price")
    .populate("customer", "name email");

  // Đếm tổng số đơn hàng của người dùng hiện tại
  const total = await Order.countDocuments({ user: req.user.id });

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

exports.updateUserOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status, orderLocation } = req.body;

  const order = await Order.findOne({ _id: id, user: req.user.id });

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

  if (status === "Successful delivery") {
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
