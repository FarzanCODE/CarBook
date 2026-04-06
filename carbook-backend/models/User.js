const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: [6, "Password must be atleast 6 characters"],
      select: false,
    },

    phone: {
      type: String,
      trim: true,
    },

    avatar: {
      type: String,
      deafult: "",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      deafult: "user",
    },

    googleId: {
      type: String,
      deafault: null,
    },

    isGoogleUser: {
      type: Boolean,
      deafult: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
