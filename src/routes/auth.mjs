import express from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import User from "../models/user.mjs";
import { validateSignUpData } from "../utilities/validation.mjs";

const router = express.Router();

/**
 * Signup API
 * POST /signup - Create new user and save into database
 */
router.post("/signup", async (req, res) => {
  // Create new instance of user model with req body
  const reqPayload = req.body;

  try {
    // Validate req body
    validateSignUpData(reqPayload);

    const {
      firstName,
      lastName,
      password,
      emailId,
      age,
      photoUrl,
      gender,
      about,
      skills,
    } = reqPayload;

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
      age,
      photoUrl,
      gender,
      about,
      skills,
    });

    if (skills?.length > 10) {
      throw new Error("Skills cannot be more that 10");
    }

    await user.save();

    res.status(201).send("User signed up successfully!!");
  } catch (eror) {
    console.log("signup error: ", eror.message);

    res
      .status(400)
      .send({ error: { message: `SIGNUP FAILED: ${eror.message}` } });
  }
});

/**
 * Signin API
 * POST /signin - Sign in api for user sign in
 */
router.post("/signin", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!validator.isEmail(emailId)) {
      throw new Error("Please enter a valid email id.");
    }

    const user = await User.findOne({ emailId });

    if (!user) {
      throw new Error("Invalid Credentials.");
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      throw new Error("Invalid Credentials.");
    }

    // Generate JWT token and set in response cookie
    const token = user.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 1 * 3600000), // expired in 8 hrs
      // httpOnly: true, // Flags the cookie to be accessible only by the web server.
    });

    res.status(200).send({ message: "Signed in successfully." });
  } catch (error) {
    console.log("Error while Sign In: ", error.message);

    res.status(400).send({
      error: { message: `SIGNIN FAILED: ${error.message}` },
    });
  }
});

export default router;
