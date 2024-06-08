const Message = require("../models/messageModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const responseData = require("../utils/responseData");

//createMessage
exports.createMessage = catchAsyncErrors(async (req, res, next) => {
  const { chatId, senderId, text } = req.body;

  if (!chatId || !senderId || !text) {
    return next(new ErrorHander("All fields are required", 400));
  }

  const message = new Message({
    chatId,
    senderId,
    text,
  });

  try {
    const savedMessage = await message.save();
    responseData(savedMessage, 200, "Message sent successfully", res);
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
