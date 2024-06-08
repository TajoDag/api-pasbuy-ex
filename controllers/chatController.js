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
    });
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
// exports.addMessageToChat = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const { chatId, sender, content } = req.body;
//     let message = { sender, content };
//     if (req.file) {
//       message.imageUrl = req.file.path;
//     }
//     const chat = await Chat.findById(chatId);
//     chat.messages.push(message);
//     await chat.save();
//     responseData(chat, 200, "Thêm tin nhắn thành công", res);
//   } catch (error) {
//     return next(new ErrorHander(error.message, 500));
//   }
// });

// exports.getUserChats = catchAsyncErrors(async (req, res, next) => {
//   const { userId } = req.params;
//   try {
//     const chats = await Chat.find({ participants: userId }).populate(
//       "participants messages.sender"
//     );
//     responseData(chats, 200, null, res);
//   } catch (error) {
//     return next(new ErrorHander(error.message, 500));
//   }
// });

// exports.findUserInChat = catchAsyncErrors(async (req, res, next) => {
//   const { chatId, userId } = req.query;
//   try {
//     const chat = await Chat.findById(chatId).populate("participants");
//     const user = chat.participants.find(
//       (participant) => participant._id.toString() === userId
//     );
//     if (user) {
//       responseData(user, 200, null, res);
//     } else {
//       return next(new ErrorHander("User not found in chat", 404));
//     }
//   } catch (error) {
//     return next(new ErrorHander(error.message, 500));
//   }
// });
