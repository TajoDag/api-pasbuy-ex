const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const responseData = require("../utils/responseData");

// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { username, name, email, address, password, phone, importInviteCode } = req.body;

  let userInvite = null;
  if (importInviteCode) {
    const inviter = await User.findOne({ inviteCode: importInviteCode });
    if (inviter) {
      userInvite = {
        name: inviter.name,
        email: inviter.email,
        username: inviter.username,
        inviteCode: inviter.inviteCode,
      };
    } else {
      return next(new ErrorHander("Invalid invite code", 400));
    }
  }

  const newInviteCode = crypto.randomBytes(4).toString("hex");

  const user = await User.create({
    username,
    name,
    email,
    password,
    phone,
    address,
    inviteCode: newInviteCode,
    userInvite,
    avatar: {
      public_id: "sample id",
      url: "https://thuvienplus.com/themes/cynoebook/public/images/default-user-image.png",
    },
  });

  sendToken(user, 201, res, "User registered successfully");
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new ErrorHander("Enter username and password", 400));
  }

  const user = await User.findOne({ username }).select("+password");

  if (!user) {
    return next(new ErrorHander("Wrong Username or password", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Wrong Username or password", 400));
  }

  sendToken(user, 200, res, "User logged in successfully");
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Đăng xuất",
  });
});

// Get User Detail
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander(" mật khẩu cũ không đúng", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("Hai mật khẩu không trùng", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
  };

  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// Get all users(admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  responseData(users, 200, null, res);
});

//findAll
exports.findAllUsers = catchAsyncErrors(async (req, res, next) => {
  const { name, page = 1, limit = 9 } = req.body; // Lấy thông tin từ body
  const skip = (page - 1) * parseInt(limit);

  const query = name ? { name: { $regex: name, $options: "i" } } : {}; // Tìm kiếm không phân biệt hoa thường

  // Tìm kiếm và phân trang
  const users = await User.find(query).skip(skip).limit(parseInt(limit));

  // Đếm tổng số bản ghi phù hợp
  const total = await User.countDocuments(query);

  // Tính tổng số trang
  const totalPages = Math.ceil(total / parseInt(limit));

  // Phản hồi dữ liệu tới client
  responseData(
    {
      users,
      total,
      totalPages,
      currentPage: parseInt(page),
      pageSize: parseInt(limit),
    },
    200,
    "Tìm kiếm thành công",
    res
  );
});

// Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`Người dùng không tồn tại với Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`Người dùng không tồn tại với Id: ${req.params.id}`, 400)
    );
  }

  const imageId = user.avatar.public_id;

  await cloudinary.v2.uploader.destroy(imageId);

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "Xóa tài khoản thành công",
  });
});
