const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
  text: {
    type: String,
  },
  text2: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("About", aboutSchema);
