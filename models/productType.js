const mongoose = require("mongoose");

const productTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nhập tên loại sản phẩm"],
    trim: true,
  },
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
module.exports = mongoose.model("ProductType", productTypeSchema);
