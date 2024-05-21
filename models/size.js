const mongoose = require("mongoose");

const SizeProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nhập loại size"],
    trim: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  isShow: {
    type: Boolean,
    default: false,
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
module.exports = mongoose.model("SizeProduct", SizeProductSchema);
