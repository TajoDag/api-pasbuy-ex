const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Agency = require("../models/agencyModel");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const responseData = require("../utils/responseData");
const bcrypt = require("bcryptjs");

// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { username, name, address, password, phone, importInviteCode } =
    req.body;

  const existingUserByUsername = await User.findOne({ username });
  if (existingUserByUsername) {
    return next(new ErrorHander("Username already exists", 400));
  }

  let userInvite = null;
  let role = "user";
  let isShop = false;

  if (importInviteCode) {
    const inviter = await User.findOne({ inviteCode: importInviteCode });
    if (inviter) {
      userInvite = {
        name: inviter.name,
        email: inviter.email,
        username: inviter.username,
        inviteCode: inviter.inviteCode,
        _id: inviter._id,
      };

      // Kiểm tra role của người giới thiệu
      if (inviter.role === "admin") {
        role = "agency";
        isShop = true;
      }
    } else {
      return next(new ErrorHander("Invalid invite code", 400));
    }
  }

  // Sinh mã giới thiệu với chữ PB ở đầu và 6 số ở phía sau
  const newInviteCode = `PB${Math.floor(100000 + Math.random() * 900000)}`;

  const user = await User.create({
    username,
    name,
    password,
    phone,
    address,
    inviteCode: newInviteCode,
    userInvite,
    role,
    isShop,
    avatar: {
      public_id: "sample id",
      url: "https://thuvienplus.com/themes/cynoebook/public/images/default-user-image.png",
    },
  });

  // Tạo bảng agency nếu role là agency
  if (role === "agency") {
    await Agency.create({
      homeAgents: user._id,
      products: [],
    });
  }

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

  responseData(user, 200, null, res);
});

// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Mật khẩu cũ không đúng", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("Hai mật khẩu không trùng", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  responseData(user, 200, "Mật khẩu đã được cập nhật thành công", res);
});
// update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    bankName: req.body.bankName,
    bankNumber: req.body.bankNumber,
    owner: req.body.owner,
  };

  // if (req.body.avatar !== "") {
  //   const user = await User.findById(req.user.id);

  //   const imageId = user.avatar.public_id;

  //   await cloudinary.v2.uploader.destroy(imageId);

  //   const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //     folder: "avatars",
  //     width: 150,
  //     crop: "scale",
  //   });

  //   newUserData.avatar = {
  //     public_id: myCloud.public_id,
  //     url: myCloud.secure_url,
  //   };
  // }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  // res.status(200).json({
  //   success: true,
  //   user,
  // });

  responseData(user, 200, null, res);
});
exports.updateUserAndPassword = catchAsyncErrors(async (req, res, next) => {
  const { name, phone, oldPassword, newPassword, confirmPassword } = req.body;

  try {
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (name) {
      user.name = name;
    }

    if (phone) {
      user.phone = phone;
    }

    if (oldPassword && newPassword && confirmPassword) {
      const isPasswordMatched = await user.comparePassword(oldPassword);

      if (!isPasswordMatched) {
        return next(new ErrorHander("Mật khẩu cũ không đúng", 400));
      }

      if (newPassword !== confirmPassword) {
        return next(new ErrorHander("Hai mật khẩu không trùng", 400));
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
exports.updateUserSing = async (req, res, next) => {
  const { name, phone, password } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (name) {
      user.name = name;
    }

    if (phone) {
      user.phone = phone;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Get all users(admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  responseData(users, 200, null, res);
});

exports.findAllUsers = catchAsyncErrors(async (req, res, next) => {
  const { search, role, page = 0, size = 10 } = req.body;
  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  const query = {
    role: { $ne: "Super Admin" }, // Thêm điều kiện để không tìm thấy role Super Admin
  };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
    ];
  }

  if (role) {
    query.role = role;
  }

  // Tìm kiếm và phân trang
  const users = await User.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  // Đếm tổng số bản ghi phù hợp
  const total = await User.countDocuments(query);

  // Tính tổng số trang
  const totalPages = Math.ceil(total / limit);

  // Phản hồi dữ liệu tới client
  responseData(
    {
      users,
      pagination: {
        total,
        page: parseInt(page),
        size: parseInt(size),
        totalPages,
      },
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

  responseData(user, 200, "Tìm kiếm thành công", res);
});

// update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    role: req.body.role,
    phone: req.body.phone,
    bankName: req.body.bankName,
    bankNumber: req.body.bankNumber,
    owner: req.body.owner,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    return responseData(null, 404, "Không tìm thấy người dùng", res);
  }

  responseData(user, 200, "Cập nhật thành công", res);
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

exports.getUsersByInviteCode = catchAsyncErrors(async (req, res, next) => {
  const { inviteCode, page = 0, size = 10 } = req.body;
  const limit = parseInt(size);
  const skip = parseInt(page) * limit;

  // Điều kiện tìm kiếm với inviteCode trong userInvite
  const query = { "userInvite.inviteCode": inviteCode };

  // Tìm kiếm và phân trang
  const users = await User.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  // Đếm tổng số bản ghi phù hợp
  const total = await User.countDocuments(query);

  // Tính tổng số trang
  const totalPages = Math.ceil(total / limit);

  // Phản hồi dữ liệu tới client
  responseData(
    {
      users,
      pagination: {
        total,
        page: parseInt(page),
        size: parseInt(size),
        totalPages,
      },
    },
    200,
    "Tìm kiếm thành công",
    res
  );
});

exports.resetUserPassword = catchAsyncErrors(async (req, res, next) => {
  const { userId, newPassword } = req.body;

  // Kiểm tra xem người dùng có tồn tại không
  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHander("User not found", 404));
  }

  // Cập nhật mật khẩu mới cho người dùng và đánh dấu là mật khẩu được cấp lại
  user.password = newPassword;
  user.isResetPassword = true;

  await user.save();

  // Tạo token mới
  const token = user.getJWTToken();

  // Thiết lập cookie token
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res
    .status(200)
    .cookie("token", token, options)
    .json({
      success: true,
      message: "Password has been reset successfully",
      data: {
        user,
        forceLogout: true,
      },
    });
});
