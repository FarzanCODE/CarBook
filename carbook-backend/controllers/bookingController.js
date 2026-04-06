const {
  sendEmail,
  bookingConfirmedEmail,
  bookingCancelledEmail,
  bookingCompletedEmail,
} = require("../config/email");
const Booking = require("../models/Booking");
const Car = require("../models/Car");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

const calculateAmount = (
  car,
  bookingType,
  startDate,
  endDate,
  selectedPackage,
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const diffWeeks = diffDays / 7;
  let totalAmount = 0;
  let totalHours = 0;
  if (bookingType === "hourly") {
    totalHours = Math.ceil(diffHours);
    totalAmount = totalHours * car.pricing.perHour;
  } else if (bookingType === "daily") {
    const days = Math.ceil(diffDays);
    totalAmount = days * car.pricing.perDay;
  } else if (bookingType === "weekly") {
    const weeks = Math.ceil(diffWeeks);
    totalAmount = weeks * car.pricing.perWeek;
  } else if (bookingType === "package") {
    totalAmount = selectedPackage.price;
  }
  return { totalAmount, totalHours };
};

const createBooking = async (req, res) => {
  try {
    const {
      carId,
      bookingType,
      startDate,
      endDate,
      pickupLocation,
      dropLocation,
      selectedPackage,
    } = req.body;
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    if (!car.isAvailable) {
      return res
        .status(400)
        .json({ message: "Car is not available for booking" });
    }
    const overlappingBooking = await Booking.findOne({
      car: carId,
      status: "confirmed",
      $and: [
        { startDate: { $lt: new Date(endDate) } },
        { endDate: { $gt: new Date(startDate) } },
      ],
    });
    if (overlappingBooking) {
      return res
        .status(400)
        .json({ message: "Car is already booked for these dates." });
    }
    const { totalAmount, totalHours } = calculateAmount(
      car,
      bookingType,
      startDate,
      endDate,
      selectedPackage,
    );
    if (totalAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid booking duration or pricing not set" });
    }
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `booking_${Date.now()}`,
      notes: {
        carId: carId,
        userId: req.user._id.toString(),
      },
    });
    const booking = await Booking.create({
      user: req.user._id,
      car: carId,
      bookingType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalHours,
      totalAmount,
      pickupLocation,
      dropLocation: dropLocation || "",
      selectedPackage: bookingType === "package" ? selectedPackage : undefined,
      status: "pending",
      payment: {
        razorpayOrderId: razorpayOrder.id,
        status: "pending",
      },
    });
    res.status(201).json({
      success: true,
      booking,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
    if (expectedSignature !== razorpaySignature) {
      booking.payment.status = "failed";
      await booking.save();
      return res
        .status(400)
        .json({ message: "Payment verification failed — invalid signature" });
    }
    booking.status = "confirmed";
    booking.payment.razorpayPaymentId = razorpayPaymentId;
    booking.payment.razorpaySignature = razorpaySignature;
    booking.payment.status = "paid";
    booking.payment.paidAt = new Date();
    await booking.save();
    const populatedBooking = await Booking.findById(booking._id).populate(
      "car",
    );
    sendEmail({
      to: req.user.email,
      subject: "Booking Confirmed — CarBook 🎉",
      html: bookingConfirmedEmail(req.user, booking, populatedBooking.car),
    }).catch((err) => console.log("Confirmation email error:", err.message));
    await Car.findByIdAndUpdate(booking.car, { isAvailable: false });
    res.status(200).json({
      success: true,
      message: "Payment verified, booking confirmed!",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("car", "name brand images pricing category location")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("car", "name brand images pricing location")
      .populate("user", "name email phone");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this booking" });
    }
    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this booking" });
    }
    if (["cancelled", "completed"].includes(booking.status)) {
      return res
        .status(400)
        .json({ message: `Booking is already ${booking.status}` });
    }
    booking.status = "cancelled";
    booking.cancellationReason = cancellationReason || "Cancelled by user";
    booking.cancelledAt = new Date();
    booking.payment.status = "refunded";
    await booking.save();
    const populatedBooking = await Booking.findById(booking._id).populate(
      "car",
    );
    const user = await require("../models/User").findById(booking.user);
    sendEmail({
      to: user.email,
      subject: "Booking Cancelled — CarBook",
      html: bookingCancelledEmail(user, booking, populatedBooking.car),
    }).catch((err) => console.log("Cancellation email error:", err.message));
    await Car.findByIdAndUpdate(booking.car, { isAvailable: true });
    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let query = {};
    if (status) query.status = status;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    const bookings = await Booking.find(query)
      .populate("user", "name email phone")
      .populate("car", "name brand category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    const total = await Booking.countDocuments(query);
    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.status !== "confirmed") {
      return res
        .status(400)
        .json({ message: "Only confirmed bookings can be completed" });
    }
    booking.status = "completed";
    await booking.save();
    const populatedBooking = await Booking.findById(booking._id)
      .populate("car")
      .populate("user");
    sendEmail({
      to: populatedBooking.user.email,
      subject: "Trip Completed — CarBook 🏁",
      html: bookingCompletedEmail(
        populatedBooking.user,
        booking,
        populatedBooking.car,
      ),
    }).catch((err) => console.log("Completion email error:", err.message));
    await Car.findByIdAndUpdate(booking.car, { isAvailable: true });
    res.status(200).json({
      success: true,
      message: "Booking marked as completed",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      totalRevenue,
      totalCars,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "cancelled" }),
      Booking.countDocuments({ status: "completed" }),
      Booking.aggregate([
        { $match: { "payment.status": "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Car.countDocuments(),
    ]);
    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCars,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminConfirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Only pending bookings can be confirmed. Current status: ${booking.status}` });
    }
    booking.status = "confirmed";
    booking.payment.status = "paid";
    if (!booking.payment.paidAt) booking.payment.paidAt = new Date();
    await booking.save();
    const populatedBooking = await Booking.findById(booking._id)
      .populate("car")
      .populate("user");
    sendEmail({
      to: populatedBooking.user.email,
      subject: "Booking Confirmed — CarBook 🎉",
      html: bookingConfirmedEmail(
        populatedBooking.user,
        booking,
        populatedBooking.car,
      ),
    }).catch((err) => console.log("Manual confirmation email error:", err.message));
    await Car.findByIdAndUpdate(booking.car, { isAvailable: false });
    res.status(200).json({
      success: true,
      message: "Booking confirmed manually",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminDeleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.status === "confirmed") {
      await Car.findByIdAndUpdate(booking.car, { isAvailable: true });
    }
    await booking.deleteOne();
    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
