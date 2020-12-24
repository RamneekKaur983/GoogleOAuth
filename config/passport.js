const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const user = require("../models/User");

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

//passport template code
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const exsistingUser = await user.User.findOne({
          "google.id": profile.id,
        });
        if (exsistingUser) {
          return done(null, exsistingUser);
        }

        const newUser = new user.User({
          method: "google",
          google: {
            id: profile.id,
            email: profile.emails[0].value,
            token: accessToken,
          },
        });
        await newUser.save();
        done(null, newUser);
      } catch (err) {
        done(err, false, err.message);
      }
    }
  )
);
