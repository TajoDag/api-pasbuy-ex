const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nhập tên danh mục"],
    trim: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
});
module.exports = mongoose.model("Categories", categoriesSchema);
