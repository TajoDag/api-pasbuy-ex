const Wallet = require("../models/walletModel");
const User = require("../models/userModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const responseData = require("../utils/responseData");
const ErrorHander = require("../utils/errorhander");

const generateCode = (prefix) => {
  const randomNumbers = Math.floor(100000 + Math.random() * 900000).toString();
  return `${prefix}${randomNumbers}`;
};

exports.requestWithdraw = catchAsyncErrors(async (req, res, next) => {
  const { amount, message, note } = req.body;

  const user = await User.findById(req.user._id);

  if (user.point <= 10) {
    return next(
      new ErrorHander("You must have more than 10 points to withdraw", 400)
    );
  }

  if (user.point < amount) {
    return next(
      new ErrorHander("Insufficient points for this withdrawal", 400)
    );
  }

  const code = generateCode("RT");

  const walletRequest = await Wallet.create({
    customer: req.user._id,
    amount,
    message,
    note,
    code,
    handler: req.user._id,
    type: "withdraw",
  });

  responseData(
    walletRequest,
    201,
    "Withdraw request created successfully",
    res
  );
});
exports.confirmWithdraw = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const walletRequest = await Wallet.findById(id);

  if (!walletRequest) {
    return next(new ErrorHander("Withdraw request not found", 404));
  }

  const user = await User.findById(walletRequest.customer);
  if (!user) {
    return next(new ErrorHander("User not found", 404));
  }

  if (status === "success") {
    if (user.point < walletRequest.amount) {
      return next(
        new ErrorHander("Insufficient points for this withdrawal", 400)
      );
    }
    user.point -= walletRequest.amount;
    await user.save();
  }

  walletRequest.status = status;
  //   walletRequest.handler = handler;

  await walletRequest.save();

  responseData(
    walletRequest,
    200,
    "Withdraw request confirmed successfully",
    res
  );
});

exports.depositMoney = catchAsyncErrors(async (req, res, next) => {
  const { customer, amount, message, note } = req.body;

  // Tìm người dùng khách hàng
  const customerUser = await User.findById(customer);
  if (!customerUser) {
    return next(new ErrorHander("Customer not found", 404));
  }

  const code = generateCode("NT");

  // Tạo yêu cầu nạp tiền
  const depositRequest = await Wallet.create({
    customer,
    amount,
    message,
    note,
    status: "success",
    handler: req.user._id,
    code,
    type: "deposit",
  });

  // Cập nhật điểm của người dùng khách hàng
  customerUser.point += amount;
  await customerUser.save();

  responseData(depositRequest, 201, "Money deposited successfully", res);
});

exports.getWithdrawRequests = catchAsyncErrors(async (req, res, next) => {
  const { page = 0, size = 10 } = req.query;

  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  const withdrawRequests = await Wallet.find({
    // status: "Processing",
    type: "withdraw",
  })
    .skip(skip)
    .limit(limit)
    .populate("customer", "name email")
    .populate("handler", "name email");

  const total = await Wallet.countDocuments({
    // status: "Processing",
    type: "withdraw",
  });

  const result = {
    withdrawRequests,
    pagination: {
      total,
      page: parseInt(page),
      size: parseInt(size),
    },
  };

  responseData(result, 200, "Withdraw requests fetched successfully", res);
});

exports.getDepositRequests = catchAsyncErrors(async (req, res, next) => {
  const { page = 0, size = 10 } = req.query;

  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  const depositRequests = await Wallet.find({
    // status: "success",
    type: "deposit",
  })
    .skip(skip)
    .limit(limit)
    .populate("customer", "name email")
    .populate("handler", "name email");

  const total = await Wallet.countDocuments({
    // status: "success",
    type: "deposit",
  });

  const result = {
    depositRequests,
    pagination: {
      total,
      page: parseInt(page),
      size: parseInt(size),
    },
  };

  responseData(result, 200, "Deposit requests fetched successfully", res);
});

exports.getWithdrawHistoryByCustomer = catchAsyncErrors(
  async (req, res, next) => {
    const { customerId } = req.params;

    const withdrawHistory = await Wallet.find({
      customer: customerId,
      type: "withdraw",
    })
      .populate("customer", "name email")
      .populate("handler", "name email");

    responseData(
      withdrawHistory,
      200,
      "Withdraw history fetched successfully",
      res
    );
  }
);

exports.getDepositHistoryByCustomer = catchAsyncErrors(
  async (req, res, next) => {
    const { customerId } = req.params;

    const depositHistory = await Wallet.find({
      customer: customerId,
      status: "success",
      type: "deposit",
    })
      .populate("customer", "name email")
      .populate("handler", "name email");

    responseData(
      depositHistory,
      200,
      "Deposit history fetched successfully",
      res
    );
  }
);
