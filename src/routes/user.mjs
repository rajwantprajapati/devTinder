import exporess from "express";
import { userAuth } from "../middlewares/auth.mjs";
import ConnectionRequest from "../models/connectionRequest.mjs";
import User from "../models/user.mjs";

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

/**
 * Feed API to get the list of users to be shown to logged in user
 */
router.get("/feed", userAuth, async (req, res) => {
  try {
    // logged in user should see all the users excepts
    // 1. His own details
    // 2. His connections
    // 3. Users to whom connection is already sent
    // 4. Users, who are already ignored

    const loggedInUser = req.user;

    // pagination using limit and skip
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;

    const skip = (page - 1) * limit; // skip number of documents

    // find the connections of the logged in user.
    const connections = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    // get unique ids from the connections which we need to filter out before sending feeds
    const hideUsersFromFeed = new Set();
    connections.forEach(({ toUserId, fromUserId }) => {
      hideUsersFromFeed.add(toUserId);
      hideUsersFromFeed.add(fromUserId);
    });

    // Find all the users, who is not in connection with logged in user and is not logged in user
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.status(200).json({ message: "Feed fetch successfully.", data: users });
  } catch (error) {
    console.log(`ERROR IN FETCHING FEEDS: ${error.message}`);

    res
      .status(400)
      .json({ message: `ERROR IN FETCHING FEEDS: ${error.message}` });
  }
});

export default router;
