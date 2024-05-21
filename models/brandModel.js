const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nhập tên hãng"],
    trim: true,
  },
  address: {
    type: String,
    required: [true, "Nhập tên địa chỉ"],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "Nhập tên số điện thoại"],
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
module.exports = mongoose.model("Brand", brandSchema);
