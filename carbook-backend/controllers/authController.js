const { sendEmail, welcomeEmail } = require("../config/email");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const {
  generateToken,
  sendTokenCookie,
} = require("../middleware/authMiddleware");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email and password" });
    }

    if (name.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Name must be at least 2 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    if (phone) {
      const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
        return res.status(400).json({
          message:
            "Please enter a valid Indian phone number (10 digits starting with 6-9)",
        });
      }
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isAdmin = email === process.env.ADMIN_EMAIL;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      role: isAdmin ? "admin" : "user",
    });

    const token = generateToken(user._id, user.role);
    sendTokenCookie(res, token);

    sendEmail({
      to: user.email,
      subject: "Welcome to CarBook! 🚗",
      html: welcomeEmail(user),
    })
      .then(() => {
        console.log("Welcome email sent successfully to:", user.email);
      })
      .catch((err) => {
        console.log("Welcome email FAILED:", err.message);
        console.log("Full error:", err);
      });

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (user.isGoogleUser && !user.password) {
      return res.status(400).json({
        message: "This account uses Google login. Please sign in with Google",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.email === process.env.ADMIN_EMAIL && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const token = generateToken(user._id, user.role);
    sendTokenCookie(res, token);
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logoutUser = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true },
    );
    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
  changePassword,
};
