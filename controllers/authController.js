const UserModel = require("../models/User");
const jwt = require('jsonwebtoken');
const crypto= require('crypto')
const bcrypt = require('bcrypt')
const async = require("async");
const nodemailer = require('nodemailer')
const randomstring = require('randomstring')
const mailer = require('../misc/mailer');
const { models } = require("mongoose");


// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered';
  }
  // email not verified
  if(err.message = 'email not verified')
  {
    errors.email= 'Email Not Verified'
  }

  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'net ninja secret', {
    expiresIn: maxAge
  });
};

// controller actions
module.exports.signup_get = (req, res) => {
  res.send("Signup")
}

module.exports.login_get = (req, res) => {
  res.send("Login")
}

module.exports.signup_post = async (req, res) => {



  try {
    console.log(req.body)
    const { email, password } = req.body;
    const user = await new UserModel.User({ method: 'local', local: { email, password } });
    const randomSecretToken =randomstring.generate()
    user.set({"local.secretToken" : randomSecretToken})
    user.set({"local.active" : false})
    console.log('User', user)
    await user.save()
    const html =`Hi there , 
    <br/>
    Thank you for registering !
    <br/><br/>
    Please verify your email by typing the following token :
    <br/>
    Token : <b>${randomSecretToken}</b>
    <br/>
    On the following page :
    <a href  ="http://localhost:3000/api/verify">http://localhost:3000/api/verify</a>
    <br/><br/>
    Have a pleasant day !`;

    await mailer.sendEmail('ramneek983@gmail.com' , email , 'Please verify your email' , html);
    const token = createToken(user._id);

    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  }
  catch (err) {
    console.log(err)
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

}

module.exports.login_post = async (req, res) => {
  console.log(req.body)


  try {
    const { email, password } = req.body;
    const user = await UserModel.User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  }
  catch (err) {

    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

}
module.exports.verify = async(req, res)=>
{
  const secretToken = req.body.secretToken
  const currUser = await UserModel.User.findOne({"local.secretToken": secretToken})
  console.log(currUser)
  if(!currUser)
  {
    res.status(400).send('Some error occured please try again')
  }
  currUser.set({"local.active":true})
  currUser.set({"local.secretToken" : " "})
  console.log(currUser)
 //const newuser= await UserModel.User.findOneAndUpdate({"local.secretToken": secretToken}  , {"local.active":true , "local.secretToken":" "})
  res.send('Verified Email')
}

module.exports.googleOAuth = async (req, res, next) => {
 
  res.status(200).json(req.user)
}

module.exports.forgotPassword= function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      UserModel.User.findOne({ "local.email": req.body.email }, function(err, user) {
        if (!user) {
          
          res.send('No user with that email exsists')
        }

        user.local.resetPasswordToken = token;
        user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour
 
        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: '// add your email here',
          pass: '// add your password here'
        }
      });
      var mailOptions = {
        to: user.local.email,
        from: 'bytecodebytes@gmail.com',
        subject: 'Code Bytes  Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        res.send("Mail sent")
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    
  });
}

module.exports.resetPassword = function(req, res) {
  async.waterfall([
    function(done) {
      UserModel.User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, async function(err, user) {
        if (!user) {
          
          res.status(400).send("Password reset token has expired or is invalid")
        
        }
        if(req.body.password === req.body.confirm) {

          
          try
          {const tempPass= await bcrypt.hash(req.body.password ,10)
              User.updateOne({"local.email":user.email} , {"local.password":tempPass} , function(err)
              {
                  console.log(err)
              })
          }
          catch(e){
              console.log(e)
          }
         
          user.setPassword(req.body.password, function(err) {
              if(err)
              {
                  console.log(err)
              }
            user.local.resetPasswordToken = undefined;
            user.local.resetPasswordExpires = undefined;

            user.save(function(err) {
              
                  if(err)
                  {
                      console.log(err)
                  }
                done(err, user);
           
            });
          })
        } else {
          
            res.status(400).send('Passwords Did not match')
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'bytecodebytes@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'bytecodebytes@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
          res.send('Password has been reset')
        done(err);
      });
    }
  ], function(err) {
    res.send("Error Resetting the Password")
  });
}




