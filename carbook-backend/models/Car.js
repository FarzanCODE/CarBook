const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Car name is required"],
      trim: true,
    },

    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Sedan",
        "SUV",
        "Luxury",
        "Electric",
        "Bike/Scooter",
        "Mini/Hatchback",
        "General",
      ],
    },

    description: {
      type: String,
      trim: true,
    },

    pricing: {
      perHour: { type: Number, default: 0 },
      perDay: { type: Number, default: 0 },
      perWeek: { type: Number, default: 0 },
      packages: [
        {
          label: { type: String },
          price: { type: Number },
          durationDays: { type: Number },
        },
      ],
    },

    specs: {
      seats: { type: Number, default: 5 },
      fuelType: {
        type: String,
        enum: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"],
        default: "Petrol",
      },
      transmission: {
        type: String,
        enum: ["Manual", "Automatic", "Semi-Automatic", "CVT", "DCT", "AMT"],
        default: "Manual",
      },
      mileage: { type: String },
      year: { type: Number },
    },

    images: [
      {
        type: String,
      },
    ],

    location: {
      type: String,
      required: [true, "Car location is required"],
      trim: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },

  {
    timestamps: true,
  },
);

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
