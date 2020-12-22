const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'net ninja secret', (err, decodedToken) => {
      if (err) {
        console.log(err.message);

      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    console.log("Unauthorised")
  }
};

module.exports = { requireAuth };