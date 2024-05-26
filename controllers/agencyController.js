const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorhander");
const Agency = require("../models/agencyModel");
const responseData = require("../utils/responseData");

exports.getAgencyByHomeAgentId = catchAsyncErrors(async (req, res, next) => {
  const { homeAgentId } = req.params;

  const agency = await Agency.findOne({ homeAgents: homeAgentId }).populate(
    "products.product"
  );

  if (!agency) {
    return next(new ErrorHander("Agency not found", 404));
  }

  responseData(agency, 200, "Lấy thông tin Agency thành công", res);
});
