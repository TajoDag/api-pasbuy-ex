const SizeProduct = require("../models/size");
const OrderP = require("../models/order");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const responseData = require("../utils/responseData");

exports.createSize = catchAsyncErrors(async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const size = await SizeProduct.create(req.body);
    responseData(size, 200, "Tạo loại size mới thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

exports.getAllSize = catchAsyncErrors(async (req, res, next) => {
  const size = await SizeProduct.find();
  responseData(size, 200, null, res);
});

exports.updateSize = catchAsyncErrors(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    status: req.body.status,
    isShow: req.body.isShow,
  };
  const size = await SizeProduct.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!size) {
    return next(new ErrorHander("Không tìm thấy loại size", 404));
  }

  responseData(size, 200, "Chỉnh sửa thành công", res);
});

exports.deleteSize = catchAsyncErrors(async (req, res, next) => {
  const size = await SizeProduct.findByIdAndDelete(req.params.id);

  if (!size) {
    return next(new ErrorHander("Không tìm thấy loại size", 404));
  }

  responseData(null, 200, "Xoá dữ liệu thành công", res);
});
