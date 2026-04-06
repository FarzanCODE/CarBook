const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

const {
  getHomeSettings,
  updateFounderProfile,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/homeSettingsController");

router.get("/", getHomeSettings);
router.put(
  "/founder",
  protect,
  adminOnly,
  upload.single("image"),
  updateFounderProfile,
);
router.post("/testimonial", protect, adminOnly, addTestimonial);
router.put("/testimonial", protect, adminOnly, updateTestimonial);
router.delete(
  "/testimonial/:testimonialId",
  protect,
  adminOnly,
  deleteTestimonial,
);

module.exports = router;
