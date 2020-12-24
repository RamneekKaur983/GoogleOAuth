const UserModel = require("../models/User");
const jwt = require("jsonwebtoken");
const HttpError = require("../models/httpError"); //Helper function for Handle error

// handle errors
const handleErrors = (err) => {
  let errors = { email: "", password: "" };
  // incorrect credentials
  if (
    err.message === "incorrect email" ||
    err.message === "incorrect password"
  ) {
    return new HttpError(
      "Could not find the identity user, Credentials seem to be wrong.",
      401
    );
  }

  // duplicate email error
  if (err.code === 11000) {
    return new HttpError("User already exist", 422);
  }

  // validation errors
  if (err.message.includes("User validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

//SignUp Controller
module.exports.signup_post = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await new UserModel.User({
      method: "local",
      local: { name, email, password },
    });
    await user.save();
    const token = createToken(user._id);
    res.status(201).json({ userId: user._id, token: token });
  } catch (err) {
    const errors = handleErrors(err);
    return next(errors);
  }
};

//Login Controller
module.exports.login_post = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ userId: user._id, token });
  } catch (err) {
    const errors = handleErrors(err);
    return next(errors);
  }
};
