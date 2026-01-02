import exporess from "express";
import { userAuth } from "../middlewares/auth.mjs";
import ConnectionRequest from "../models/connectionRequest.mjs";

const router = exporess.Router();

/**
 * API to get all the pending request for the logged in user.
 */
router.get("/requests/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate(
      "fromUserId",
      "firstName lastName photoUrl gender about skills", // or [firstName, lastName, photoUrl, gender, about, skills]
    );

    res
      .status(200)
      .json({
        message: "Connect requests fetched successfully.",
        data: connectionRequests,
      });
  } catch (error) {
    console.log(`ERROR IN FETCHING REQUESTS: ${error.message}`);

    res
      .status(400)
      .json({ message: `ERROR IN FETCHING REQUESTS: ${error.message}` });
  }
});

export default router;
