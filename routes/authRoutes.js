const { Router } = require('express');
const authController = require('../controllers/authController');

const GooglePlusTokenStrategy = require('passport-google-plus-token');
const passport= require('passport')
const user = require("../models/User");

const router = Router();
// Google OAuth Strategy
passport.use('googleToken', new GooglePlusTokenStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  }, async (accessToken, refreshToken, profile, done) => {
  
    try{
      console.log('accessToken' , accessToken)
      console.log('refeshToken' , refreshToken)
      console.log('Profile' , profile)
      
      
      const exsistingUser = await user.User.findOne({"google.id": profile.id})
      if(exsistingUser)
      {
        return done(null , exsistingUser)
      }
      
      const newUser= new user.User({
        method :'google' , 
        google :{
          id : profile.id , 
          email :profile.emails[0].value
        }
      })
      await newUser.save()
      done(null , newUser)
    }
    catch(err)
    {
      done(err, false, err.message)
  
    }
  
  
  }))

  //routes

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.post('/oauth/google' , 
  passport.authenticate('googleToken' , {session : false}), authController.googleOAuth)



module.exports = router;