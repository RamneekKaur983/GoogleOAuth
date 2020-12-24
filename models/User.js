const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ["local", "google"],
    required: true,
  },
  local: {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      validate: [isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: [6, "Minimum password length is 6 characters"],
    },
  },
  google: {
    id: {
      type: String,
    },
    email: {
      type: String,
    },
    token: {
      type: String,
    },
  },
});

// fire a function before doc saved to db
userSchema.pre("save", async function (next) {
  if (this.method != "local") {
    next();
  }
  const salt = await bcrypt.genSalt();
  this.local.password = await bcrypt.hash(this.local.password, salt);
  next();
});

// static method to login user
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ "local.email": email });
  if (user) {
    const auth = await bcrypt.compare(password, user.local.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};

const User = mongoose.model("user", userSchema);

exports.User = User;
exports.userSchema = userSchema;
