const express = require("express");
const router = express.Router();

const {
  createBooking,
  verifyPayment,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  completeBooking,
  getAdminStats,
  adminConfirmBooking,
  adminDeleteBooking,
} = require("../controllers/bookingController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, createBooking);
router.post("/verify-payment", protect, verifyPayment);
router.get("/my-bookings", protect, getMyBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id/cancel", protect, cancelBooking);

router.get("/admin/all", protect, adminOnly, getAllBookings);
router.get("/admin/stats", protect, adminOnly, getAdminStats);
router.put("/:id/confirm", protect, adminOnly, adminConfirmBooking);
router.put("/:id/complete", protect, adminOnly, completeBooking);
router.delete("/:id", protect, adminOnly, adminDeleteBooking);

module.exports = router;
