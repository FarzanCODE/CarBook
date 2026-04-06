const Car = require("../models/Car");
const { cloudinary } = require("../config/cloudinary");

const addCar = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      description,
      location,
      isAvailable,
      perHour,
      perDay,
      perWeek,
      seats,
      fuelType,
      transmission,
      mileage,
      year,
      packages,
    } = req.body;
    const imageUrls = req.files ? req.files.map((file) => file.path) : [];
    console.log("Checkmate");

    let parsedPackages = [];
    if (packages) parsedPackages = JSON.parse(packages);

    const car = await Car.create({
      name,
      brand,
      category,
      description,
      location,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      pricing: {
        perHour: Number(perHour) || 0,
        perDay: Number(perDay) || 0,
        perWeek: Number(perWeek) || 0,
        packages: parsedPackages,
      },
      specs: {
        seats: Number(seats) || 5,
        fuelType: fuelType || "Petrol",
        transmission: transmission || "Manual",
        mileage: mileage || "",
        year: Number(year) || null,
      },
      images: imageUrls,
      addedBy: req.user._id,
    });

    res.status(201).json({ success: true, car });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: error.message });
  }
};

const getAllCars = async (req, res) => {
  try {
    const {
      category,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      search,
      sortBy,
      location,
      page = 1,
      limit = 10,
    } = req.query;
    let query = {};
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: "i" };
    if (fuelType) query["specs.fuelType"] = fuelType;
    if (transmission) query["specs.transmission"] = transmission;
    if (minPrice || maxPrice) {
      query["pricing.perDay"] = {};
      if (minPrice) query["pricing.perDay"].$gte = Number(minPrice);
      if (maxPrice) query["pricing.perDay"].$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }
    let sortOption = { createdAt: -1 };
    if (sortBy === "price_asc") sortOption = { "pricing.perDay": 1 };
    if (sortBy === "price_desc") sortOption = { "pricing.perDay": -1 };
    if (sortBy === "rating") sortOption = { averageRating: -1 };
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    const cars = await Car.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate("addedBy", "name email");
    const total = await Car.countDocuments(query);
    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      cars,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate("addedBy", "name email")
      .populate("reviews.user", "name avatar");
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.status(200).json({ success: true, car });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    const {
      name,
      brand,
      category,
      description,
      location,
      isAvailable,
      perHour,
      perDay,
      perWeek,
      packages,
      seats,
      fuelType,
      transmission,
      mileage,
      year,
    } = req.body;
    const newImageUrls = req.files ? req.files.map((file) => file.path) : [];
    const updatedImages = [...car.images, ...newImageUrls];
    let parsedPackages = car.pricing.packages;
    if (packages) parsedPackages = JSON.parse(packages);
    car.name = name || car.name;
    car.brand = brand || car.brand;
    car.category = category || car.category;
    car.description = description || car.description;
    car.location = location || car.location;
    car.isAvailable = isAvailable !== undefined ? isAvailable : true;
    car.images = updatedImages;
    car.pricing = {
      perHour: Number(perHour) || car.pricing.perHour,
      perDay: Number(perDay) || car.pricing.perDay,
      perWeek: Number(perWeek) || car.pricing.perWeek,
      packages: parsedPackages,
    };
    car.specs = {
      seats: Number(seats) || car.specs.seats,
      fuelType: fuelType || car.specs.fuelType,
      transmission: transmission || car.specs.transmission,
      mileage: mileage || car.specs.mileage,
      year: year || car.specs.year,
    };
    const updatedCar = await car.save();
    res.status(200).json({ success: true, car: updatedCar });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCarImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const publicId = `carbook/cars/${fileName.split(".")[0]}`;
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    car.images = car.images.filter((img) => img !== imageUrl);
    await car.save();
    res.status(200).json({ success: true, message: "Image deleted", car });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    for (const imageUrl of car.images) {
      const urlParts = imageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const publicId = `carbook/cars/${fileName.split(".")[0]}`;
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    }
    await car.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    const alreadyReviewed = car.reviews.find(
      (r) => r.user.toString() === req.user._id.toString(),
    );
    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this Car" });
    }
    car.reviews.push({
      user: req.user._id,
      rating: Number(rating),
      comment: comment || "",
    });
    car.totalReviews = car.reviews.length;
    car.averageRating =
      car.reviews.reduce((acc, r) => acc + r.rating, 0) / car.totalReviews;
    await car.save();
    res.status(201).json({ success: true, message: "Review added", car });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCarImage,
  deleteCar,
  addReview,
};
