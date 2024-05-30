const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary");
const Banner = require("../models/bannerModel");
const ErrorHander = require("../utils/errorhander");
const responseData = require("../utils/responseData");

// exports.createBanner = catchAsyncErrors(async (req, res, next) => {
//   let images = [];

//   // Kiểm tra xem req.body.images có tồn tại hay không
//   if (req.body.images) {
//     if (typeof req.body.images === "string") {
//       images.push(req.body.images);
//     } else {
//       images = req.body.images;
//     }
//   } else {
//     return next(new ErrorHander("No images provided", 400));
//   }

//   const imagesLinks = [];

//   for (let i = 0; i < images.length; i++) {
//     const result = await cloudinary.v2.uploader.upload(images[i], {
//       folder: "banners",
//     });

//     imagesLinks.push({
//       public_id: result.public_id,
//       url: result.secure_url,
//     });
//   }

//   req.body.images = imagesLinks;

//   const banner = await Banner.create(req.body);

//   responseData(banner, 200, "Thêm banner thành công", res);
// });

// exports.updateBanner = catchAsyncErrors(async (req, res, next) => {
//   let banner = await Banner.findOne();

//   if (!banner) {
//     return next(new ErrorHander("Không tìm thấy banner", 404));
//   }

//   // Nếu có mảng hình ảnh mới để cập nhật
//   if (req.body.images && req.body.images.length > 0) {
//     // Xóa tất cả các hình ảnh hiện tại từ Cloudinary
//     for (const img of banner.images) {
//       await cloudinary.v2.uploader.destroy(img.public_id);
//     }
//     // Xóa toàn bộ mảng hình ảnh trong banner
//     banner.images = [];

//     // Thêm các hình ảnh mới từ mảng
//     for (const image of req.body.images) {
//       const result = await cloudinary.v2.uploader.upload(image, {
//         folder: "banners",
//       });
//       banner.images.push({
//         public_id: result.public_id,
//         url: result.secure_url,
//       });
//     }
//   }

//   // Cập nhật các trường khác nếu có trong req.body
//   if (req.body.status !== undefined) {
//     banner.status = req.body.status;
//   }

//   // Lưu thay đổi vào cơ sở dữ liệu
//   await banner.save();

//   responseData(banner, 200, "Banner đã được cập nhật", res);
// });

// exports.deleteBannerImage = catchAsyncErrors(async (req, res, next) => {
//   const bannerId = req.params.bannerId; // ID của banner
//   const imageId = req.params.imageId; // public_id của ảnh cần xóa

//   // Tìm banner bằng ID
//   const banner = await Banner.findById(bannerId);
//   if (!banner) {
//     return next(new ErrorHander("Không tìm thấy banner", 404));
//   }

//   // Tìm và xóa ảnh từ mảng ảnh của banner
//   const imageIndex = banner.images.findIndex(
//     (img) => img.public_id === imageId
//   );
//   if (imageIndex === -1) {
//     return next(new ErrorHander("Không tìm thấy ảnh", 404));
//   }

//   // Xóa ảnh từ Cloudinary
//   await cloudinary.uploader.destroy(banner.images[imageIndex].public_id);

//   // Xóa ảnh khỏi mảng và cập nhật banner
//   banner.images.splice(imageIndex, 1);
//   await banner.save();

//   responseData(banner, 200, "Ảnh đã được xóa khỏi banner", res);
// });

// exports.getBanners = catchAsyncErrors(async (req, res, next) => {
//   const banners = await Banner.find();

//   responseData(banners, 200, "Danh sách banner", res);
// });

exports.createBanner = catchAsyncErrors(async (req, res, next) => {
  let images = [];

  // Kiểm tra xem req.body.images có tồn tại hay không
  if (req.body.images) {
    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
  } else {
    return next(new ErrorHander("No images provided", 400));
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

  // Nếu có mảng hình ảnh mới để cập nhật
  if (req.body.images && req.body.images.length > 0) {
    // Xóa tất cả các hình ảnh hiện tại từ Cloudinary
    for (const img of banner.images) {
      await cloudinary.v2.uploader.destroy(img.public_id);
    }
    // Xóa toàn bộ mảng hình ảnh trong banner
    banner.images = [];

    // Thêm các hình ảnh mới từ mảng
    for (const image of req.body.images) {
      const result = await cloudinary.v2.uploader.upload(image, {
        folder: "banners",
      });
      banner.images.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  }

  // Cập nhật các trường khác nếu có trong req.body
  if (req.body.status !== undefined) {
    banner.status = req.body.status;
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

exports.getBanners = catchAsyncErrors(async (req, res, next) => {
  const banners = await Banner.find();

  responseData(banners, 200, "Danh sách banner", res);
});
exports.getBannerDetail = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const banner = await Banner.findById(id);

  if (!banner) {
    return next(new ErrorHander("Không tìm thấy banner", 404));
  }

  responseData(banner, 200, "Chi tiết banner", res);
});