import express from "express";
import { userAuth } from "../middlewares/auth.mjs";

const router = express.Router();

/**
 * Profile API
 * GET /profile - get user details using cookie
 */
router.get("/", userAuth, async (req, res) => {
  try {
    res
      .status(200)
      .send({ message: "Profile fetched successfully", data: req.user });
  } catch (error) {
    console.log("error in fetching profile: ", error.message);

    res.status(400).send({
      error: { message: `FETCH PROFILE FAILED: ${error.message}` },
    });
  }
});

export default router;
