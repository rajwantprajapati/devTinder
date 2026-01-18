import express from "express";
import validator from "validator";
import bcrypt from "bcrypt";
import { userAuth } from "../middlewares/auth.mjs";
import { validateUpdateProfileData } from "../utilities/validation.mjs";

const router = express.Router();

/**
 * View Profile API
 * GET /profile/view - get user details using cookie
 */
router.get("/view", userAuth, async (req, res) => {
  const { firstName, lastName, photoUrl, gender, about, skills, age } =
    req.user;

  const userSafeData = {
    firstName: firstName,
    lastName: lastName,
    photoUrl: photoUrl,
    gender: gender,
    about: about,
    skills: skills,
    age: age,
  };
  try {
    res
      .status(200)
      .json({ message: "Profile fetched successfully", data: userSafeData });
  } catch (error) {
    console.log("error in fetching profile: ", error.message);

    res.status(400).json({
      error: { message: `FETCH PROFILE FAILED: ${error.message}` },
    });
  }
});

/**
 * Update Profile API
 * PATCH /profile/edit - get user details using cookie
 */
router.patch("/edit", userAuth, async (req, res) => {
  try {
    const requestBody = req.body;

    if (!validateUpdateProfileData(requestBody)) {
      throw new Error("Bad Request Paylaod.");
    }

    const { photoUrl, skills } = requestBody;

    if (!validator.isURL(photoUrl)) {
      throw new Error("Photo URL is not valid.");
    }

    if (skills?.length > 10) {
      throw new Error("Max 10 skills allowed.");
    }

    const loggedInUser = req.user; // user is added in req payload in userAuth middlewares

    // Update keys value in user
    Object.keys(requestBody).forEach(
      (key) => (loggedInUser[key] = requestBody[key]),
    );

    await loggedInUser.save();

    res
      .status(200)
      .json({ message: "Profile updated successfully.", data: loggedInUser });
  } catch (error) {
    console.log("error in updating profile: ", error.message);

    res.status(400).json({
      error: { message: `UPDATE PROFILE FAILED: ${error.message}` },
    });
  }
});

/**
 * Update password API
 * PATCH /profile/update-password - api to update user password
 */
router.patch("/update-password", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const loggedInUser = req.user; // user is added in req payload in userAuth middlewares

    // Validate old password
    const isOldPasswordValid = await loggedInUser.validatePassword(oldPassword);

    if (!isOldPasswordValid) {
      throw new Error("Incorrect old password.");
    }

    if (!validator.isStrongPassword(newPassword)) {
      throw new Error(
        "New password should have min 8 characters, atleast 1 lowercase, atleast 1 uppercase and atleast 1 special character",
      );
    }

    // Generate hash of the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    loggedInUser.password = hashedPassword;

    await loggedInUser.save();

    res
      .status(200)
      .json({ message: "Password updated successfully.", data: loggedInUser });
  } catch (error) {
    console.log("error in updating password: ", error.message);

    res.status(400).json({
      error: { message: `UPDATE PASSWORD FAILED: ${error.message}` },
    });
  }
});

export default router;
