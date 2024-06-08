const Chat = require("../models/chatModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const responseData = require("../utils/responseData");

exports.createChat = catchAsyncErrors(async (req, res, next) => {
  const { firstId, secondId } = req.body;

  try {
    const chat = await Chat.findOne({
      members: { $all: [firstId, secondId] },
    });

    if (chat) return responseData(chat, 200, "successfully", res);

    const newChat = new Chat({
      members: [firstId, secondId],
    });

    const response = await newChat.save();
    responseData(response, 200, "successfully", res);
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

exports.findUserChats = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const chats = await Chat.find({
      members: { $in: [userId] },
    }).populate("members", "username email");
    responseData(chats, 200, "successfully", res);
  } catch (err) {
    return next(new ErrorHander(err.message, 500));
  }
});

exports.findChat = catchAsyncErrors(async (req, res, next) => {
  const { firstId, secondId } = req.params;
  try {
    const chats = await Chat.find({
      members: { $all: [firstId, secondId] },
    });
    responseData(chats, 200, "successfully", res);
  } catch (err) {
    return next(new ErrorHander(err.message, 500));
  }
});
