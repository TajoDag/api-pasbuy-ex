const mongoose = require("mongoose");

const infoCompanySchema = new mongoose.Schema({
  text: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("InfoCompany", infoCompanySchema);
