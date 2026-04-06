const HomeSettings = require("../models/HomeSettings");
const { cloudinary } = require("../config/cloudinary");

const getHomeSettings = async (req, res) => {
  try {
    let settings = await HomeSettings.findOne();
    if (!settings) {
      settings = await HomeSettings.create({
        founder: {
          name: "Md Farzan Farooquee",
          role: "Founder & Owner, CarBook",
          bio: "Passionate about making car rentals accessible, affordable and hassle-free for everyone across India. CarBook was built with the vision of giving every person access to their dream car.",
          image: "",
        },
        testimonials: [
          {
            name: "John Doe",
            city: "Delhi",
            text: "Amazing experience! The car was in great condition and the booking process was seamless.",
            rating: 5,
          },
          {
            name: "Jane Smith",
            city: "Mumbai",
            text: "Very affordable prices and great customer support. Highly recommended!",
            rating: 5,
          },
          {
            name: "Robert Wilson",
            city: "Bangalore",
            text: "The best car rental service I've ever used. Definitely booking again.",
            rating: 5,
          },
        ],
      });
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFounderProfile = async (req, res) => {
  try {
    const { name, role, bio } = req.body;
    console.log("Update founder request body:", { name, role, bio });
    console.log("Update founder file:", req.file);

    let settings = await HomeSettings.findOne();
    if (!settings) {
      settings = new HomeSettings({
        founder: { name, role, bio, image: "" },
        testimonials: [],
      });
    } else {
      settings.founder.name = name || settings.founder.name;
      settings.founder.role = role || settings.founder.role;
      settings.founder.bio = bio || settings.founder.bio;
    }

    if (req.file) {
      console.log("New image path:", req.file.path);
      if (settings.founder.image && settings.founder.image !== req.file.path) {
        try {
          const parts = settings.founder.image.split("/");
          const fileName = parts.pop().split(".")[0];
          const folder = parts.includes("profiles")
            ? "carbook/profiles"
            : "carbook/cars";
          const publicId = `${folder}/${fileName}`;
          console.log("Deleting old image publicId:", publicId);
          await cloudinary.uploader.destroy(publicId);
        } catch (delError) {
          console.error("Cloudinary delete error (caught):", delError.message);
        }
      }
      settings.founder.image = req.file.path;
    }

    await settings.save();
    console.log(
      "Founder profile saved successfully. Image URL:",
      settings.founder.image,
    );
    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error("Update founder error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const addTestimonial = async (req, res) => {
  try {
    const { name, city, text, rating } = req.body;
    let settings = await HomeSettings.findOne();
    if (!settings) settings = new HomeSettings();

    settings.testimonials.push({
      name,
      city,
      text,
      rating: Number(rating) || 5,
    });
    await settings.save();
    res.status(201).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const { testimonialId, name, city, text, rating } = req.body;
    const settings = await HomeSettings.findOne();
    const testimonial = settings.testimonials.id(testimonialId);
    if (!testimonial)
      return res.status(404).json({ message: "Testimonial not found" });

    testimonial.name = name || testimonial.name;
    testimonial.city = city || testimonial.city;
    testimonial.text = text || testimonial.text;
    testimonial.rating = Number(rating) || testimonial.rating;

    await settings.save();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const { testimonialId } = req.params;
    const settings = await HomeSettings.findOne();
    settings.testimonials = settings.testimonials.filter(
      (t) => t._id.toString() !== testimonialId,
    );
    await settings.save();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHomeSettings,
  updateFounderProfile,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
