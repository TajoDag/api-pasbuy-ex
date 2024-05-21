const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Product = require("../models/productModel");
const Brand = require("../models/brandModel");
const Categories = require("../models/categoriesModel");
const ProductType = require("../models/productType");
const ErrorHander = require("../utils/errorhander");
const responseData = require("../utils/responseData");
const cloudinary = require("cloudinary");

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    const { brand, category, productType } = req.body;

    const brandDoc = await Brand.findOne({ _id: brand, status: true });
    const categoryDoc = await Categories.findOne({
      _id: category,
      status: true,
    });
    const productTypeDoc = await ProductType.findOne({
      _id: productType,
      status: true,
    });

    if (!brandDoc) {
      return next(
        new ErrorHander(
          "Không thể tạo sản phẩm khi trạng thái của nhãn hiệu này chưa được kích hoạt",
          400
        )
      );
    }
    if (!categoryDoc) {
      return next(
        new ErrorHander(
          "Không thể tạo sản phẩm khi trạng thái của danh mục này chưa được kích hoạt",
          400
        )
      );
    }
    if (!productTypeDoc) {
      return next(
        new ErrorHander(
          "Không thể tạo sản phẩm khi trạng thái của loại sản phẩm này chưa được kích hoạt",
          400
        )
      );
    }

    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    const imagesLinks = [];

    for (let i = 0; i < images?.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    responseData(product, 200, "Tạo sản phẩm mới thành công", res);
  } catch (error) {
    console.log(error);
    return next(new ErrorHander(error.message, 500));
  }
});

// exports.createProduct = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const { brand, category, productType } = req.body;

//     const brandDoc = await Brand.findOne({ _id: brand, status: true });
//     const categoryDoc = await Categories.findOne({
//       _id: category,
//       status: true,
//     });
//     const productTypeDoc = await ProductType.findOne({
//       _id: productType,
//       status: true,
//     });

//     if (!brandDoc) {
//       return next(
//         new ErrorHander(
//           "Không thể tạo sản phẩm khi trạng thái của nhãn hiệu này chưa được kích hoạt",
//           400
//         )
//       );
//     }
//     if (!categoryDoc) {
//       return next(
//         new ErrorHander(
//           "Không thể tạo sản phẩm khi trạng thái của danh mục này chưa được kích hoạt",
//           400
//         )
//       );
//     }
//     if (!productTypeDoc) {
//       return next(
//         new ErrorHander(
//           "Không thể tạo sản phẩm khi trạng thái của loại sản phẩm này chưa được kích hoạt",
//           400
//         )
//       );
//     }

//     let images = req.files;

//     const imagesLinks = [];

//     for (let i = 0; i < images?.length; i++) {
//       const result = await cloudinary.v2.uploader.upload(images[i].path, {
//         folder: "products",
//       });

//       imagesLinks.push({
//         public_id: result.public_id,
//         url: result.secure_url,
//       });
//     }

//     req.body.images = imagesLinks;
//     req.body.user = req.user.id;

//     const product = await Product.create(req.body);

//     responseData(product, 200, "Tạo sản phẩm mới thành công", res);
//   } catch (error) {
//     console.log(error);
//     return next(new ErrorHander(error.message, 500));
//   }
// });

exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  const { name, productType, category, brand, page = 0, size = 10 } = req.body;

  // Tạo đối tượng lọc
  let filter = {};

  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }
  if (productType) {
    filter.productType = productType;
  }
  if (category) {
    filter.category = category;
  }
  if (brand) {
    filter.brand = brand;
  }

  // Tính toán phân trang
  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  // Lấy danh sách sản phẩm với lọc và phân trang
  const products = await Product.find(filter)
    .skip(skip)
    .limit(limit)
    .populate("brand", "_id name")
    .populate("category", "_id name")
    .populate("productType", "_id name");

  // Đếm tổng số sản phẩm
  const total = await Product.countDocuments(filter);

  // Trả về dữ liệu và thông tin phân trang
  const result = {
    products,
    pagination: {
      total,
      page: parseInt(page),
      size: parseInt(size),
    },
  };

  responseData(result, 200, null, res);
});