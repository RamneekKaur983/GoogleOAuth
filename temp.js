
  app.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            
            res.send('No user with that email exsists')
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
   
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
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
  });
  

  
  app.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, async function(err, user) {
          if (!user) {
            
            res.status(400).send("Password reset token has expired or is invalid")
          
          }
          if(req.body.password === req.body.confirm) {

            
            try
            {const tempPass= await bcrypt.hash(req.body.password ,10)
                User.updateOne({email:user.email} , {password:tempPass} , function(err)
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
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                
                    if(err)
                    {
                        console.log(err)
                    }
                  done(err, user);
             
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
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
  });





