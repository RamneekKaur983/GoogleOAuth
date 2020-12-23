const { Router } = require("express");
const authController = require("../controllers/authController");

const GooglePlusTokenStrategy = require("passport-google-plus-token");
const passport = require("passport");
const user = require("../models/User");

const router = Router();
// Google OAuth Strategy
passport.use(
  "googleToken",
  new GooglePlusTokenStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:8000/api/oauth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("accessToken", accessToken);
        console.log("refeshToken", refreshToken);
        console.log("Profile", profile);

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

//routes
router.post("/signup", authController.signup_post); //SignUpPOST r
router.post("/login", authController.login_post); //LoginPOST
//GoogleSignUpPOST
router.get(
  "/oauth/google",
  passport.authenticate("googleToken", { scope: ["profile", "email"] })
);

router.get(
  "/oauth/google/callback",
  passport.authenticate("googleToken", {
    failureRedirect: "/auth",
    session: false,
  }),
  authController.googleOAuth
);

// router.get("/oauth/google/callback")

module.exports = router;
