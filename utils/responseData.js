const responseData = (data, statusCode, message, res) => {
  res.status(statusCode).json({
    status: statusCode === 200 || statusCode === 201 ? true : false,
    message:
      statusCode === 200 || statusCode === 201 ? message : "Đã có lỗi xảy ra",
    data: data,
  });
};
module.exports = responseData;
