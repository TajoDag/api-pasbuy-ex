const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary");
const Banner = require("../models/bannerModel");
const ErrorHander = require("../utils/errorhander");

exports.createBanner = catchAsyncErrors(async (req, res, next) => {
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "banners",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;

  const banner = await Banner.create(req.body);

  responseData(banner, 200, "Thêm banner thành công", res);
});

exports.updateBanner = catchAsyncErrors(async (req, res, next) => {
  let banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new ErrorHander("Không tìm thấy banner", 404));
  }

  // Xóa ảnh
  if (req.body.deleteImages) {
    for (const publicId of req.body.deleteImages) {
      await cloudinary.v2.uploader.destroy(publicId);
      banner.images = banner.images.filter((img) => img.public_id !== publicId);
    }
  }

  // Thêm ảnh mới
  if (req.body.newImages) {
    for (const image of req.body.newImages) {
      const result = await cloudinary.v2.uploader.upload(image, {
        folder: "banners",
      });
      banner.images.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  }

  // Cập nhật ảnh
  if (req.body.updateImages) {
    for (const updateImage of req.body.updateImages) {
      const imageIndex = banner.images.findIndex(
        (img) => img.public_id === updateImage.public_id
      );
      if (imageIndex !== -1) {
        // Xóa ảnh cũ trên Cloudinary
        await cloudinary.v2.uploader.destroy(
          banner.images[imageIndex].public_id
        );
        // Tải lên ảnh mới và cập nhật trong mảng
        const result = await cloudinary.v2.uploader.upload(
          updateImage.newImage,
          {
            folder: "banners",
          }
        );
        banner.images[imageIndex] = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }
    }
  }

  // Lưu thay đổi vào cơ sở dữ liệu
  await banner.save();

  responseData(banner, 200, "Banner đã được cập nhật", res);
});

exports.deleteBannerImage = catchAsyncErrors(async (req, res, next) => {
  const bannerId = req.params.bannerId; // ID của banner
  const imageId = req.params.imageId; // public_id của ảnh cần xóa

  // Tìm banner bằng ID
  const banner = await Banner.findById(bannerId);
  if (!banner) {
    return next(new ErrorHander("Không tìm thấy banner", 404));
  }

  // Tìm và xóa ảnh từ mảng ảnh của banner
  const imageIndex = banner.images.findIndex(
    (img) => img.public_id === imageId
  );
  if (imageIndex === -1) {
    return next(new ErrorHander("Không tìm thấy ảnh", 404));
  }

  // Xóa ảnh từ Cloudinary
  await cloudinary.v2.uploader.destroy(banner.images[imageIndex].public_id);

  // Xóa ảnh khỏi mảng và cập nhật banner
  banner.images.splice(imageIndex, 1);
  await banner.save();

  responseData(banner, 200, "Ảnh đã được xóa khỏi banner", res);
});
