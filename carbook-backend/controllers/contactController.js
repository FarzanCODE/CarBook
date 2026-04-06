const {
  sendEmail,
  contactAdminEmail,
  contactThankYouEmail,
} = require("../config/email");

const sendContactEmail = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    await sendEmail({
      to: "farzan.farooquee@gmail.com",
      subject: `New Inquiry from ${name} 📩`,
      html: contactAdminEmail(name, email, message),
    });

    await sendEmail({
      to: email,
      subject: "We've received your message! - CarBook 🚗",
      html: contactThankYouEmail(name),
    });

    res.status(200).json({
      success: true,
      message: "Message sent! We will get back to you soon.",
    });
  } catch (error) {
    console.error("Contact Email Error:", error);
    res
      .status(500)
      .json({ message: "Failed to send message. Please try again later." });
  }
};

module.exports = {
  sendContactEmail,
};
