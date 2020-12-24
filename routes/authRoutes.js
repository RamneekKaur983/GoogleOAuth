const { Router } = require("express");
const authController = require("../controllers/authController");

const router = Router();

//routes
router.post("/signup", authController.signup_post); //SignUpPOST
router.post("/login", authController.login_post); //LoginPOST

module.exports = router;
