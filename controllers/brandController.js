const Brand = require("../models/brandModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const responseData = require("../utils/responseData");

exports.createBrand = catchAsyncErrors(async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const brand = await Brand.create(req.body);
    responseData(brand, 200, "Tạo thương hiệu sản phẩm mới thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

exports.getAllBrand = catchAsyncErrors(async (req, res, next) => {
  const brand = await Brand.find();
  responseData(brand, 200, null, res);
});

exports.updateBrand = catchAsyncErrors(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    address: req.body.address,
    phone: req.body.phone,
    status: req.body.status,
    isShow: req.body.isShow,
  };
  const brand = await Brand.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!brand) {
    return next(new ErrorHander("Không tìm thấy thương hiệu", 404));
  }

  responseData(brand, 200, "Chỉnh sửa thành công", res);
});

exports.deleteBrand = catchAsyncErrors(async (req, res, next) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);

  if (!brand) {
    return next(new ErrorHander("Không tìm thấy thương hiệu", 404));
  }

  responseData(null, 200, "Xoá dữ liệu thành công", res);
});
