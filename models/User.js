const mongoose= require('mongoose')
const { isEmail } = require('validator')
const bcrypt= require('bcrypt')


const userSchema = new mongoose.Schema({

  method : {
    type : String , 
    enum : ['local' , 'google'] , 
    required : true

  } , 
  local :{
    email: {
      type: String,
     
      unique: true,
      lowercase: true,
      validate: [isEmail, 'Please enter a valid email']
    },
    password: {
      type: String,
     
      minlength: [6, 'Minimum password length is 6 characters'],
    } , 
    secretToken : String , 
    active : Boolean , 
    resetPasswordToken: String,
    resetPasswordExpires: Date 
     
  } , 
    google :{
      id :{
        type : String
      } , 
      email : String

    }

})

// fire a function before doc saved to db
userSchema.pre('save', async function(next) {

    if(this.method != 'local')
    {
      next()
    }
    const salt = await bcrypt.genSalt();
    this.local.password = await bcrypt.hash(this.local.password, salt);



    console.log("I am in pre" , this.local.email)
    next();
  });
  
  // static method to login user
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ "local.email":email });
    if (user) {
      const auth = await bcrypt.compare(password, user.local.password);
      if(user.local.active==false)
      {
        throw Error('email not verified')
      }
      if (auth) {
        return user;
      }
      throw Error('incorrect password');
    }
    throw Error('incorrect email');
  };

  
  const User = mongoose.model('user', userSchema);
  
 exports.User= User
 exports.userSchema = userSchema