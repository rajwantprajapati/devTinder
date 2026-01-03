import exporess from "express";
import { userAuth } from "../middlewares/auth.mjs";
import ConnectionRequest from "../models/connectionRequest.mjs";

const router = exporess.Router();

// fields that needs to be populated in connections
const USER_SAFE_DATA = "firstName lastName photoUrl gender about skills";

/**
 * API to get all the pending request for the logged in user.
 */
router.get("/requests/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA); // or [firstName, lastName, photoUrl, gender, about, skills]

    res.status(200).json({
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

/**
 * API to get all the connections for the logged in user.
 */
router.get("/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connections.map((connection) => {
      if (connection.fromUserId._id.equals(loggedInUser._id)) {
        return connection.toUserId;
      }

      return connection.fromUserId;
    });

    res.status(200).json({
      message: "Connects fetched successfully.",
      data,
    });
  } catch (error) {
    console.log(`ERROR IN FETCHING CONNECTIONS: ${error.message}`);

    res
      .status(400)
      .json({ message: `ERROR IN FETCHING CONNECTIONS: ${error.message}` });
  }
});

export default router;
