import jwt from "jsonwebtoken";

//function to generate token

export const generateToken = (userid) => {
  const token = jwt.sign({ userid }, process.env.JWT_SECRET);
  return token;
};
