const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary");
const LogoHeader = require("../models/logoHeaderModel");
const ErrorHander = require("../utils/errorhander");

exports.createLogoHeader = catchAsyncErrors(async (req, res, next) => {
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "logoHeader",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks[0];

  const logo = await LogoHeader.create(req.body);

  responseData(logo, 200, "Thêm logo thành công", res);
});
exports.updateLogoHeader = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let logo = await LogoHeader.findById(id);

  if (!logo) {
    return next(new ErrorHander("Không tìm thấy logo", 404));
  }

  // Xóa hình ảnh cũ khỏi Cloudinary
  const oldImageId = logo.images.public_id;
  await cloudinary.v2.uploader.destroy(oldImageId);

  // Tải hình ảnh mới lên Cloudinary
  const newImage = req.body.image; // Chỉ chấp nhận một hình ảnh mới
  const result = await cloudinary.v2.uploader.upload(newImage, {
    folder: "logoHeader",
  });

  // Cập nhật đối tượng hình ảnh
  logo.images = {
    public_id: result.public_id,
    url: result.secure_url,
  };

  await logo.save();

  responseData(logo, 200, "Cập nhật logo thành công", res);
});
