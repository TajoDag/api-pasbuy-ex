const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Enter name"],
    maxLength: [30, "Name must not be longer than 30 characters"],
    minLength: [4, "Minimum name 4 characters"],
  },
  username: {
    type: String,
    required: [true, "Enter username"],
    maxLength: [30, "Name must not be longer than 30 characters"],
    minLength: [4, "Minimum name 4 characters"],
  },
  email: {
    type: String,
    validate: [validator.isEmail, "Email format is incorrect"],
    // default: "null",
  },
  password: {
    type: String,
    required: [true, "Enter password"],
    minLength: [6, "Password minimum 6 characters"],
    select: false,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
    // default: "null",
  },
  inviteCode: {
    type: String,
  },
  importInviteCode: {
    type: String,
  },
  userInvite: {
    name: String,
    email: String,
    username: String,
    inviteCode: String,
  },
  avatar: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare Password

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
