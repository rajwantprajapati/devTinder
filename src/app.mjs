import express from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { connectDB } from "./config/database.mjs";
import User from "./models/user.mjs";
import { validateSignUpData } from "./utilities/validation.mjs";

const app = express();

// req body parser middleware
app.use(express.json());
app.use(cookieParser());

try {
  await connectDB();

  console.log("DB Connection Success!!");

  /**
   * Signup API
   * POST /signup - Create new user and save into database
   */
  app.post("/signup", async (req, res) => {
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
  app.post("/signin", async (req, res) => {
    try {
      const { emailId, password } = req.body;

      if (!validator.isEmail(emailId)) {
        throw new Error("Please enter a valid email id.");
      }

      const user = await User.findOne({ emailId });

      if (!user) {
        throw new Error("Invalid Credentials.");
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error("Invalid Credentials.");
      }

      // Generate JWT token and set in response cookie
      const jwtToken = jwt.sign({ _id: user._id }, "");

      res.cookie("token", jwtToken);

      res.status(200).send({ message: "Signed in successfully." });
    } catch (error) {
      console.log("Error while Sign In: ", error.message);

      res.status(400).send({
        error: { message: `SIGNIN FAILED: ${error.message}` },
      });
    }
  });

  /**
   * Find User by email id
   * GET /user - get user by email id
   */
  app.get("/user", async (req, res) => {
    const userEmailId = req.body.emailId;

    try {
      const user = await User.findOne({ emailId: userEmailId });

      if (!user) {
        throw new Error("User not found!");
      }

      res.status(200).send(user);
    } catch (error) {
      console.log("error in fetching user by email: ", error.message);

      res.status(400).send({
        error: { message: `FETCH BY EMAIL FAILED: ${error.message}` },
      });
    }
  });

  /**
   * Delete user API
   * DELETE /user api - delete user by Id
   */
  app.delete("/user", async (req, res) => {
    const userId = req.body.userId;

    try {
      const deletedUser = await User.findByIdAndDelete(userId); // or {_id: userId}

      if (!deletedUser) {
        throw new Error("User not found!");
      }

      res
        .status(200)
        .send({ message: "User deleted successfully!!", data: deletedUser });
    } catch (error) {
      console.log("error while deleting user by id: ", error.message);

      res.status(400).send({
        error: { message: `DELETE USER FAILED: ${error.message}` },
      });
    }
  });

  /**
   * Update user
   * PATCH /user api - Update user data
   */
  app.patch("/user/:userId", async (req, res) => {
    const userId = req.params?.userId;
    const data = req.body;
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];

    const isUpdateAllowed = Object.keys(data).every((key) =>
      ALLOWED_UPDATES.includes(key),
    );

    try {
      if (!isUpdateAllowed) {
        throw new Error("Some fields are not allowed to be updated!!");
      }

      if (data?.skills?.length > 10) {
        throw new Error("Skills cannot be more that 10");
      }

      const updatedUser = await User.findByIdAndUpdate(userId, data, {
        returnDocument: "after",
        runValidators: true, // run validations while update as well otherwise validations will only run when creating new document.
      });

      res
        .status(200)
        .send({ message: "User updated successfully!", data: updatedUser });
    } catch (error) {
      console.log("error while updating user: ", error.message);

      res.status(400).send({
        error: { message: `UPDATE FAILED: ${error.message}` },
      });
    }
  });

  /**
   * Feed API
   * GET /feed - get all the users from database
   */
  app.get("/feed", async (req, res) => {
    try {
      const users = await User.find();

      if (users?.length === 0) {
        throw new Error("No user found!");
      }

      res.status(200).send(users);
    } catch (error) {
      console.log("error in fetching users: ", error.message);

      res.status(400).send({
        error: { message: `FETCH ALL USERS FAILED: ${error.message}` },
      });
    }
  });

  /**
   * Profile API
   * GET /profile - get user details using cookie
   */
  app.get("/profile", async (req, res) => {
    try {
      const cookies = req.cookies;

      console.log("cookies: ", cookies);

      if (!cookies?.token) {
        throw new Error("Invalid token.");
      }

      const decodedData = jwt.verify(cookies.token, "");
      const user = await User.findById(decodedData._id);

      if (!user) {
        throw new Error("User does not exist!");
      }

      res
        .status(200)
        .send({ message: "Profile fetched successfully", data: user });
    } catch (error) {
      console.log("error in fetching profile: ", error.message);

      res.status(400).send({
        error: { message: `FETCH PROFILE FAILED: ${error.message}` },
      });
    }
  });

  // NOTE: Server should start listnening to request only after DB is connected
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log("Server is listening at port: ", PORT);
  });
} catch (error) {
  console.log("DB connection failed!!: ", error.message);
}
