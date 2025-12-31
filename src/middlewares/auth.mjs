import jwt from "jsonwebtoken";
import User from "../models/user.mjs";

export const userAuth = async (req, res, next) => {
  try {
    // Read the token from cookies
    const { token } = req.cookies;

    if (!token) {
      throw new Error("Invalid token!");
    }

    // Validate the token
    const decodedData = jwt.verify(token, "");

    // Get user data from the user id
    const user = await User.findById(decodedData._id);

    if (!user) {
      throw new Error("User not found.");
    }

    // Set user data to request
    req.user = user;

    next();
  } catch (error) {
    console.log("Error in userAuth: ", error.message);

    res
      .status(400)
      .send({ error: { message: `USER AUTH FAILED: ${error.message}` } });
  }
};
