import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

//Create a new user
router.post("/signup", async (req, res) => {
  const { email, name, password } = req.body;

  //Validation
  if (!email || !name || !password) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }

  try {
    //Checking existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: "User already exists",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Create User
    const user = new User({
      email,
      name,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    console.log(savedUser);

    res.status(201).json({
      message: "User successfully registered",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Signup failed",
    });
  }
});

//Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  //Validation
  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password both are required",
    });
  }

  try {
    //Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    //if user found, then Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "You entered a wrong password",
      });
    }

    //Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    //Success response
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Login failed",
    });
  }
});

//User data fetch from backend if already logged in and token exist in local storage
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to get user",
    });
  }
});

export default router;
