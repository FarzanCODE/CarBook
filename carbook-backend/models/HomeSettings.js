const mongoose = require("mongoose");

const homeSettingsSchema = new mongoose.Schema(
  {
    founder: {
      name: { type: String, default: "Md Farzan Farooquee" },
      role: { type: String, default: "Founder & Owner, CarBook" },
      bio: { type: String, default: "Passionate about making car rentals accessible, affordable and hassle-free for everyone across India." },
      image: { type: String, default: "" },
    },
    testimonials: [
      {
        name: { type: String, required: true },
        city: { type: String, required: true },
        text: { type: String, required: true },
        rating: { type: Number, default: 5 },
      }
    ],
  },
  { timestamps: true }
);

const HomeSettings = mongoose.model("HomeSettings", homeSettingsSchema);

module.exports = HomeSettings;
