const { Router } = require("express");
const passport = require("passport");

const router = Router();

//transferring to google for authentication
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

//Callback function after login
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  function (req, res) {
    var token = req.user.google.token;
    res.redirect("http://localhost:3000/auth/" + token);
  }
);

module.exports = router;
