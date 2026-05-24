const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../middlewares/auth');

// Register user
module.exports.register = async (req, res, next) => {
  const { firstName, lastName, middleName, email, password, mobileNo } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: "User Already Exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      middleName,
      email,
      password: hashedPassword,
      mobileNo
    });

    const result = await newUser.save();

    res.status(201).send({
      message: "User registered successfully",
      user: {
        _id: result._id,
        firstName: result.firstName,
        lastName: result.lastName,
        middleName: result.middleName,
        email: result.email,
        mobileNo: result.mobileNo
      }
    });
  } catch (err) {
    next(err);
  }
};

// Login user
module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send({ message: "Invalid Credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).send({ message: "Invalid Credentials" });

    const token = auth.createAccessToken(user);

    res.status(200).send({ message: "Login Success", auth: token });
  } catch (err) {
    next(err);
  }
};

// Get profile of logged-in user
module.exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send({ message: "User Not Found" });

    res.status(200).send({
      message: "User Profile Fetched Successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        email: user.email,
        mobileNo: user.mobileNo
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get all users (admin only)
module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).send({ message: "Users Fetched Successfully", users });
  } catch (err) {
    next(err);
  }
};

// Update user
module.exports.updateUser = async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).send({ message: "User not found" });

    res.status(200).send({
      message: "User updated successfully",
      user: {
        _id: updated._id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        middleName: updated.middleName,
        email: updated.email,
        mobileNo: updated.mobileNo
      }
    });
  } catch (err) {
    next(err);
  }
};

// Delete user
module.exports.deleteUser = async (req, res, next) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).send({ message: "User not found" });

    res.status(200).send({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};
