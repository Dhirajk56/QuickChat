import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import { User } from "../models/user.js";
import bcrypt from "bcryptjs";
// Signup a new user

export const Signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    if ((!fullName, !email, !password, !bio)) {
      return res.json({ success: false, message: "Missing Details" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "User already exist" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });
    const token = generateToken(newUser._id);

    return res.json({
      success: true,
      userData: newUser,
      token,
      message: "Account created successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//login user here
export const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if ((!email, !password)) {
      return res.json({ success: false, message: "Missing Details" });
    }
    const userData = await User.findOne({ email });
    const isPasswordCoreect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCoreect) {
      return res.json({ success: false, message: "invalid Credentails" });
    }
    const token = generateToken(userData._id);

    return res.json({
      success: true,
      userData,
      token,
      message: "Login successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
//Controller to check if user is authenticated
export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};
//Controller to update user profile details
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;
    let updateUser;
    if (!profilePic) {
      updateUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updateUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, bio, fullName },
        { new: true }
      );
    }
    res.json({ success: true, user: updateUser });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
