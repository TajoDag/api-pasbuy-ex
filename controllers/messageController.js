const Message = require("../models/messageModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const responseData = require("../utils/responseData");

//createMessage
exports.createMessage = catchAsyncErrors(async (req, res, next) => {
  const { chatId, senderId, text } = req.body;
  const message = new Message({
    chatId,
    senderId,
    text,
  });
  try {
    const rp = await message.save();
    responseData(rp, 200, "successfully", res);
  } catch (err) {
    return next(new ErrorHander(err.message, 500));
  }
});
//getMessage
exports.getMessage = catchAsyncErrors(async (req, res, next) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chatId });
    responseData(messages, 200, "successfully", res);
  } catch (err) {
    return next(new ErrorHander(err.message, 500));
  }
});
