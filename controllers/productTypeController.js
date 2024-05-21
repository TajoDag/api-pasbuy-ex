const ProductType = require("../models/productType");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const responseData = require("../utils/responseData");

exports.createProductType = catchAsyncErrors(async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const productType = await ProductType.create(req.body);
    responseData(productType, 200, "Tạo loại sản phẩm mới thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

exports.getAllProductType = catchAsyncErrors(async (req, res, next) => {
  const productType = await ProductType.find();
  responseData(productType, 200, null, res);
});

exports.updateProductType = catchAsyncErrors(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    status: req.body.status,
    isShow: req.body.isShow,
  };
  const productType = await ProductType.findByIdAndUpdate(
    req.params.id,
    newData,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  if (!productType) {
    return next(new ErrorHander("Không tìm thấy loại sản phẩm", 404));
  }

  responseData(productType, 200, "Chỉnh sửa thành công", res);
});

exports.deleteProductType = catchAsyncErrors(async (req, res, next) => {
  const productType = await ProductType.findByIdAndDelete(req.params.id);

  if (!productType) {
    return next(new ErrorHander("Không tìm thấy loại sản phẩm", 404));
  }

  responseData(null, 200, "Xoá dữ liệu thành công", res);
});
