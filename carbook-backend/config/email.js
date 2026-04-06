const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: `"CarBook" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };
  await transporter.sendMail(mailOptions);
};

const bookingConfirmedEmail = (user, booking, car) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    
    <div style="background: #1a1a2e; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="color: #e94560; margin: 0;">CarBook</h1>
      <p style="color: #ffffff; margin: 5px 0;">Your ride, your way</p>
    </div>

    <div style="padding: 30px;">
      <h2 style="color: #1a1a2e;">Booking Confirmed! 🎉</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your booking has been confirmed. Here are your booking details:</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #e94560; margin-top: 0;">Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Car</td>
            <td style="padding: 8px 0; font-weight: bold;">${car.brand} ${car.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Booking ID</td>
            <td style="padding: 8px 0; font-weight: bold;">${booking._id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Booking Type</td>
            <td style="padding: 8px 0; font-weight: bold; text-transform: capitalize;">${booking.bookingType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Start Date</td>
            <td style="padding: 8px 0; font-weight: bold;">${new Date(booking.startDate).toDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">End Date</td>
            <td style="padding: 8px 0; font-weight: bold;">${new Date(booking.endDate).toDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Pickup Location</td>
            <td style="padding: 8px 0; font-weight: bold;">${booking.pickupLocation}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Total Amount</td>
            <td style="padding: 8px 0; font-weight: bold; color: #e94560;">₹${booking.totalAmount}</td>
          </tr>
        </table>
      </div>

      <p style="color: #666;">If you have any questions, contact us at <a href="mailto:farzan.farooquee@gmail.com" style="color: #e94560;">farzan.farooquee@gmail.com</a></p>
      <p>Thank you for choosing CarBook!</p>
    </div>

    <div style="background: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
      <p style="color: #666; margin: 0; font-size: 12px;">© 2026 CarBook by Md Farzan Farooquee</p>
    </div>

  </div>
`;

const bookingCancelledEmail = (user, booking, car) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    
    <div style="background: #1a1a2e; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="color: #e94560; margin: 0;">CarBook</h1>
      <p style="color: #ffffff; margin: 5px 0;">Your ride, your way</p>
    </div>

    <div style="padding: 30px;">
      <h2 style="color: #1a1a2e;">Booking Cancelled ❌</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your booking has been cancelled. Here are the details:</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #e94560; margin-top: 0;">Cancelled Booking</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Car</td>
            <td style="padding: 8px 0; font-weight: bold;">${car.brand} ${car.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Booking ID</td>
            <td style="padding: 8px 0; font-weight: bold;">${booking._id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Cancellation Reason</td>
            <td style="padding: 8px 0; font-weight: bold;">${booking.cancellationReason}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Refund Amount</td>
            <td style="padding: 8px 0; font-weight: bold; color: #e94560;">₹${booking.totalAmount}</td>
          </tr>
        </table>
      </div>

      <p style="color: #666;">Refund will be processed within 5-7 business days.</p>
      <p style="color: #666;">For queries contact: <a href="mailto:farzan.farooquee@gmail.com" style="color: #e94560;">farzan.farooquee@gmail.com</a></p>
    </div>

    <div style="background: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
      <p style="color: #666; margin: 0; font-size: 12px;">© 2026 CarBook by Md Farzan Farooquee</p>
    </div>

  </div>
`;

const bookingCompletedEmail = (user, booking, car) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    
    <div style="background: #1a1a2e; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="color: #e94560; margin: 0;">CarBook</h1>
      <p style="color: #ffffff; margin: 5px 0;">Your ride, your way</p>
    </div>

    <div style="padding: 30px;">
      <h2 style="color: #1a1a2e;">Trip Completed! 🏁</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your trip has been completed. We hope you had a great experience!</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #e94560; margin-top: 0;">Trip Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Car</td>
            <td style="padding: 8px 0; font-weight: bold;">${car.brand} ${car.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Booking ID</td>
            <td style="padding: 8px 0; font-weight: bold;">${booking._id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Total Amount Paid</td>
            <td style="padding: 8px 0; font-weight: bold; color: #e94560;">₹${booking.totalAmount}</td>
          </tr>
        </table>
      </div>

      <p>We'd love to hear your feedback! Please leave a review for your trip.</p>
      <p style="color: #666;">Thank you for choosing CarBook. See you next time! 🚗</p>
    </div>

    <div style="background: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
      <p style="color: #666; margin: 0; font-size: 12px;">© 2026 CarBook by Md Farzan Farooquee</p>
    </div>

  </div>
`;

const welcomeEmail = (user) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    
    <div style="background: #1a1a2e; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="color: #e94560; margin: 0;">CarBook</h1>
      <p style="color: #ffffff; margin: 5px 0;">Your ride, your way</p>
    </div>

    <div style="padding: 30px;">
      <h2 style="color: #1a1a2e;">Welcome to CarBook! 🚗</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Welcome aboard! Your account has been successfully created.</p>
      <p>You can now browse and book from our wide range of cars — Sedans, SUVs, Luxury cars, Electric vehicles and more!</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}" 
           style="background: #e94560; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Start Exploring
        </a>
      </div>

      <p style="color: #666;">For any help contact: <a href="mailto:farzan.farooquee@gmail.com" style="color: #e94560;">farzan.farooquee@gmail.com</a></p>
    </div>

    <div style="background: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
      <p style="color: #666; margin: 0; font-size: 12px;">© 2026 CarBook by Md Farzan Farooquee</p>
    </div>

  </div>
`;

const contactAdminEmail = (name, email, message) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    
    <div style="background: #1a1a2e; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="color: #e94560; margin: 0;">CarBook Inquiry</h1>
      <p style="color: #ffffff; margin: 5px 0;">New Contact Message</p>
    </div>

    <div style="padding: 30px;">
      <h2 style="color: #1a1a2e;">Inquiry from ${name}</h2>
      <p><strong>Customer Name:</strong> ${name}</p>
      <p><strong>Customer Email:</strong> ${email}</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #e94560; margin-top: 0;">Message:</h3>
        <p style="white-space: pre-line;">${message}</p>
      </div>

      <p style="color: #666; font-size: 12px;">This inquiry was sent from the CarBook landing page contact form.</p>
    </div>

    <div style="background: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
      <p style="color: #666; margin: 0; font-size: 12px;">© 2026 CarBook Platform Control</p>
    </div>

  </div>
`;

const contactThankYouEmail = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    
    <div style="background: #1a1a2e; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="color: #e94560; margin: 0;">CarBook</h1>
      <p style="color: #ffffff; margin: 5px 0;">We've received your message!</p>
    </div>

    <div style="padding: 30px;">
      <h2 style="color: #1a1a2e;">Hi ${name}! 👋</h2>
      <p>Thank you for reaching out to **CarBook**. Our team has received your message and will get back to you as soon as possible.</p>
      
      <p>In the meantime, feel free to browse our latest collection of premium cars for your next trip!</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}" 
           style="background: #e94560; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Return to CarBook
        </a>
      </div>

      <p style="color: #666;">Warm regards,<br>The CarBook Team</p>
    </div>

    <div style="background: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
      <p style="color: #666; margin: 0; font-size: 12px;">© 2026 CarBook by Md Farzan Farooquee</p>
    </div>

  </div>
`;

module.exports = {
  sendEmail,
  bookingConfirmedEmail,
  bookingCancelledEmail,
  bookingCompletedEmail,
  welcomeEmail,
  contactAdminEmail,
  contactThankYouEmail,
};
