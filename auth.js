const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    "mysecretkey",
    { expiresIn: "1h" }
  );
};

module.exports = { generateToken };
