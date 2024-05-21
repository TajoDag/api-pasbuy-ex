const sendToken = (user, statusCode, res, type) => {
  const token = user.getJWTToken();

  // options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      status: statusCode === 200 || statusCode === 201 ? true : false,
      message:
        statusCode === 200 || statusCode === 201
          ? type === "login"
            ? "Đăng nhập thành công"
            : "Đăng ký thành công"
          : "Đã có lỗi xảy ra",
      data: {
        user,
        token,
      },
    });
};

module.exports = sendToken;
