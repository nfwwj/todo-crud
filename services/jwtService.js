import jwt from "jsonwebtoken";

// Function to generate a JWT
function generateToken(user_id){
  return jwt.sign({id:user_id}, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Function to verify a JWT
function verifyToken(token){
  return jwt.verify(token, process.env.JWT_SECRET);
};

export {generateToken, verifyToken};

