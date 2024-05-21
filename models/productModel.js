const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nhập tên sản phẩm"],
    trim: true,
  },
  flashDeal: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  isNew: {
    type: Boolean,
    default: false,
  },
  todayDeal: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    required: [true, "Nhập mô tả"],
  },
  promotion: {
    type: Number,
    default: 0,
    maxLength: [3, "Nhập % khuyến mãi"],
  },
  price: {
    type: Number,
    required: [true, "Nhập giá"],
    maxLength: [20, "Giá tối đa 8 ký tự"],
  },
  sizeProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Size",
    required: [true, "Nhập loại size"],
  },
  importPrice: {
    type: Number,
    required: [true, "Nhập giá"],
    maxLength: [20, "Giá tối đa 8 ký tự"],
  },
  supplier: {
    type: String,
    // required: ["Nhập nhà phân phối"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  productType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductType",
    required: [true, "Nhập loại sản phẩm"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categories",
    required: [true, "Nhập danh mục sản phẩm"],
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: [true, "Nhập nhãn hiệu sản phẩm"],
  },
  Stock: {
    type: Number,
    required: [true, "Nhập số lượng"],
    maxLength: [4, "không vượt quá 4 ký tự"],
    default: 1,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  status: {
    type: Boolean,
    default: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Product", productSchema);
