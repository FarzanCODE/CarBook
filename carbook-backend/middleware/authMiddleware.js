const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role: role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const sendTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not authorized, PLease Login" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User no longer exist" });
    }
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Token invalid or expired, Please Login again" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied - admins only" });
  }
};

module.exports = { generateToken, sendTokenCookie, protect, adminOnly };
