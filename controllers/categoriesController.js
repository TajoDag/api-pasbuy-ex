const Categories = require("../models/categoriesModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const responseData = require("../utils/responseData");

exports.createCategories = catchAsyncErrors(async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const categories = await Categories.create(req.body);
    responseData(categories, 200, "Tạo danh mục sản phẩm mới thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

exports.getAllCategories = catchAsyncErrors(async (req, res, next) => {
  const categories = await Categories.find();
  responseData(categories, 200, null, res);
});

exports.updateCategories = catchAsyncErrors(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    status: req.body.status,
    isShow: req.body.isShow,
  };
  const categories = await Categories.findByIdAndUpdate(
    req.params.id,
    newData,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  if (!categories) {
    return next(new ErrorHander("Không tìm thấy danh mục sản phẩm", 404));
  }

  responseData(categories, 200, "Chỉnh sửa thành công", res);
});

exports.deleteCategories = catchAsyncErrors(async (req, res, next) => {
  const categories = await Categories.findByIdAndDelete(req.params.id);

  if (!categories) {
    return next(new ErrorHander("Không tìm thấy danh mục sản phẩm", 404));
  }

  responseData(null, 200, "Xoá dữ liệu thành công", res);
});
