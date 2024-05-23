const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Product = require("../models/productModel");
const Brand = require("../models/brandModel");
const Size = require("../models/size");
const Categories = require("../models/categoriesModel");
const ProductType = require("../models/productType");
const ErrorHander = require("../utils/errorhander");
const responseData = require("../utils/responseData");
const cloudinary = require("cloudinary");

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    const { brand, category, productType, sizeProduct } = req.body;

    const brandDoc = await Brand.findOne({ _id: brand, status: true });
    const sizeDoc = await Size.findOne({ _id: sizeProduct, status: true });
    const categoryDoc = await Categories.findOne({
      _id: category,
      status: true,
    });
    // const productTypeDoc = await ProductType.findOne({
    //   _id: productType,
    //   status: true,
    // });

    if (!brandDoc) {
      return next(
        new ErrorHander(
          "Không thể tạo sản phẩm khi trạng thái của nhãn hiệu này chưa được kích hoạt",
          400
        )
      );
    }
    // if (!sizeDoc) {
    //   return next(
    //     new ErrorHander(
    //       "Không thể tạo sản phẩm khi trạng thái của size chưa được kích hoạt",
    //       400
    //     )
    //   );
    // }
    if (!categoryDoc) {
      return next(
        new ErrorHander(
          "Không thể tạo sản phẩm khi trạng thái của danh mục này chưa được kích hoạt",
          400
        )
      );
    }
    // if (!productTypeDoc) {
    //   return next(
    //     new ErrorHander(
    //       "Không thể tạo sản phẩm khi trạng thái của loại sản phẩm này chưa được kích hoạt",
    //       400
    //     )
    //   );
    // }

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

exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    productType,
    category,
    brand,
    sizeProduct,
    todayDeal,
    flashDeal,
    isNew,
    featured,
    page = 0,
    size = 10,
  } = req.body;

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
  if (sizeProduct) {
    filter.sizeProduct = sizeProduct;
  }
  if (todayDeal === true) {
    filter.todayDeal = true;
  }
  if (flashDeal === true) {
    filter.flashDeal = true;
  }
  if (isNew === true) {
    filter.isNew = true;
  }
  if (featured === true) {
    filter.featured = true;
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
    .populate("productType", "_id name")
    .populate("sizeProduct", "_id name");

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
exports.updateProductStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return next(new ErrorHander("Không tìm thấy sản phẩm", 404));
    }

    responseData(
      updatedProduct,
      200,
      "Cập nhật trạng thái sản phẩm thành công",
      res
    );
  } catch (error) {
    console.log(error);
    return next(new ErrorHander(error.message, 500));
  }
});

exports.updateProductFlashDeal = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { flashDeal } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { flashDeal },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return next(new ErrorHander("Không tìm thấy sản phẩm", 404));
    }

    responseData(
      updatedProduct,
      200,
      "Cập nhật trạng thái sản phẩm thành công",
      res
    );
  } catch (error) {
    console.log(error);
    return next(new ErrorHander(error.message, 500));
  }
});

exports.updateProductFeatured = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { featured } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { featured },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return next(new ErrorHander("Không tìm thấy sản phẩm", 404));
    }

    responseData(
      updatedProduct,
      200,
      "Cập nhật trạng thái sản phẩm thành công",
      res
    );
  } catch (error) {
    console.log(error);
    return next(new ErrorHander(error.message, 500));
  }
});

exports.updateProductIsNew = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { isNew } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isNew },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return next(new ErrorHander("Không tìm thấy sản phẩm", 404));
    }

    responseData(
      updatedProduct,
      200,
      "Cập nhật trạng thái sản phẩm thành công",
      res
    );
  } catch (error) {
    console.log(error);
    return next(new ErrorHander(error.message, 500));
  }
});

exports.updateProductTodayDeal = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { todayDeal } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { todayDeal },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return next(new ErrorHander("Không tìm thấy sản phẩm", 404));
    }

    responseData(
      updatedProduct,
      200,
      "Cập nhật trạng thái sản phẩm thành công",
      res
    );
  } catch (error) {
    console.log(error);
    return next(new ErrorHander(error.message, 500));
  }
});
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id)
      .populate("brand", "_id name")
      .populate("category", "_id name")
      .populate("productType", "_id name")
      .populate("sizeProduct", "_id name");

    if (!product) {
      return next(new ErrorHander("Không tìm thấy sản phẩm", 404));
    }

    responseData(product, 200, "Lấy chi tiết sản phẩm thành công", res);
  } catch (error) {
    console.log(error);
    return next(new ErrorHander(error.message, 500));
  }
});
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    const { brand, category, productType, sizeProduct } = req.body;

    const brandDoc = await Brand.findOne({ _id: brand, status: true });
    const sizeDoc = await Size.findOne({ _id: sizeProduct, status: true });
    const categoryDoc = await Categories.findOne({
      _id: category,
      status: true,
    });

    if (!brandDoc) {
      return next(
        new ErrorHander(
          "Không thể sửa sản phẩm khi trạng thái của nhãn hiệu này chưa được kích hoạt",
          400
        )
      );
    }
    if (!categoryDoc) {
      return next(
        new ErrorHander(
          "Không thể sửa sản phẩm khi trạng thái của danh mục này chưa được kích hoạt",
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

    if (images && images.length > 0) {
      const imagesLinks = [];
      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "products",
        });

        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
      req.body.images = imagesLinks;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return next(new ErrorHander("Không tìm thấy sản phẩm", 404));
    }

    responseData(updatedProduct, 200, "Sửa sản phẩm thành công", res);
  } catch (error) {
    console.log(error);
    return next(new ErrorHander(error.message, 500));
  }
});
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHander("Không tìm thấy sản phẩm", 404));
    }

    // Xóa ảnh sản phẩm trên cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await Product.deleteOne({ _id: req.params.id });

    responseData({}, 200, "Xóa sản phẩm thành công", res);
  } catch (error) {
    console.log(error);
    return next(new ErrorHander(error.message, 500));
  }
});
exports.getTotalProducts = catchAsyncErrors(async (req, res, next) => {
  try {
    const total = await Product.countDocuments();

    responseData({ total }, 200, "Tổng số sản phẩm", res);
  } catch (error) {
    console.log(error);
    return next(new ErrorHander(error.message, 500));
  }
});
