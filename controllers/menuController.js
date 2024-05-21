const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Menu = require("../models/menuModel");
const responseData = require("../utils/responseData");

exports.createMenu = catchAsyncErrors(async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const menu = await Menu.create(req.body);
    responseData(menu, 200, "Tạo menu mới thành công", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

exports.getAllMenu = catchAsyncErrors(async (req, res, next) => {
  const menu = await Menu.find();
  responseData(menu, 200, null, res);
});

exports.updateMenu = catchAsyncErrors(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    path: req.body.path,
    icon: req.body.icon,
    status: req.body.status,
    isChildren: req.body.isChildren,
    children: req.body.children,
    isShow: req.body.isShow,
  };
  const menu = await Menu.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!menu) {
    return next(new ErrorHander("Không tìm thấy menu", 404));
  }

  responseData(menu, 200, "Chỉnh sửa thành công", res);
});

exports.deleteMenu = catchAsyncErrors(async (req, res, next) => {
    const menu = await Menu.findByIdAndDelete(req.params.id);
  
    if (!menu) {
      return next(new ErrorHander("Không tìm thấy menu", 404));
    }
  
    responseData(null, 200, "Xoá dữ liệu thành công", res);
  });