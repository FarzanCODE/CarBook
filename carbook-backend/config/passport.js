const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const { sendEmail, welcomeEmail } = require("../config/email");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const avatarUrl = profile.photos?.[0]?.value || "";

        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          user.avatar = avatarUrl;
          await user.save();
          return done(null, user);
        }

        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          user.googleId = profile.id;
          user.isGoogleUser = true;
          user.avatar = avatarUrl;
          await user.save();
          return done(null, user);
        }

        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          isGoogleUser: true,
          avatar: avatarUrl,
          isEmailVerified: true,
        });

        sendEmail({
          to: user.email,
          subject: "Welcome to CarBook! 🚗",
          html: welcomeEmail(user),
        })
          .then(() => {
            console.log("Google welcome email sent to:", user.email);
          })
          .catch((err) => {
            console.log("Google welcome email failed:", err.message);
          });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

module.exports = passport;
