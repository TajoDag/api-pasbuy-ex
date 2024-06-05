const axios = require("axios");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const responseData = require("../utils/responseData");

require("dotenv").config();

const clientId = process.env.LIVECHAT_CLIENT_ID;
const clientSecret = process.env.LIVECHAT_CLIENT_SECRET;

console.log("Client ID:", clientId);
console.log("Client Secret:", clientSecret);

exports.getAccessToken = catchAsyncErrors(async (req, res, next) => {
  try {
    const response = await axios.post(
      "https://accounts.livechatinc.com/token",
      {
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }
    );
    console.log(response);
    const accessToken = response.data.access_token;
    responseData({ accessToken }, 200, "Lấy access token thành công", res);
  } catch (error) {
    console.error(
      "Error details:",
      error.response ? error.response.data : error.message
    );
    return next(new ErrorHander("Lỗi khi lấy access token", 500));
  }
});
