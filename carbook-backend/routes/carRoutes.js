const express = require("express");
const router = express.Router();

const {
  addCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCarImage,
  deleteCar,
  addReview,
} = require("../controllers/carController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

router.get("/", getAllCars);
router.get("/:id", getCarById);

router.post("/", protect, adminOnly, upload.array("images", 10), addCar);
router.put("/:id", protect, adminOnly, upload.array("images", 10), updateCar);
router.delete("/:id", protect, adminOnly, deleteCar);
router.delete("/:id/image", protect, adminOnly, deleteCarImage);

router.post("/:id/review", protect, addReview);

module.exports = router;