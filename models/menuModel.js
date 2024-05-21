const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nhập tên"],
    trim: true,
  },
  path: {
    type: String,
    required: [true, "Nhập path"],
    trim: true,
  },
  icon: {
    type: String,
    required: [true, "Chọn icon"],
    trim: true,
  },
  isShow: {
    type: Boolean,
    default: false,
  },
  isChildren: {
    type: Boolean,
    default: false,
  },
  children: {
    type: [
      {
        name: {
          type: String,
          trim: true,
          required: [true, "Nhập tên"],
        },
        path: {
          type: String,
          trim: true,
          required: [true, "Nhập path"],
        },
        icon: {
          type: String,
          required: [true, "Chọn icon"],
          trim: true,
        },
        isShow: {
          type: Boolean,
          default: false,
        },
        status: {
          type: Boolean,
          default: true,
        },
      },
    ],
    default: null,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Menu", menuSchema);
