import express from "express";
import { userAuth } from "../middlewares/auth.mjs";
import User from "../models/user.mjs";
import ConnectionRequest from "../models/connectionRequest.mjs";

const router = express.Router();

/**
 * Api to send connection request to another user.
 */
router.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const { status, toUserId } = req.params;
    const { _id: fromUserId } = req.user;

    // Validation for status, user can only sent ingored or interested status while sending connnection request
    const allowedStatus = ["ignored", "interested"];
    if (!allowedStatus.includes(status)) {
      throw new Error(`Invalid status type: ${status}`);
    }

    // Check if another user is present whom connection is being sent
    const toUser = await User.findById(toUserId);

    if (!toUser) {
      throw new Error("User not found.");
    }

    // check if there is already connection request exist between the fromUserId and toUserId
    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingConnectionRequest) {
      throw new Error("Connection request already exists.");
    }

    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    await connectionRequest.save();

    res.status(200).json({
      message:
        status === "interested"
          ? `Connection request sent to ${toUser.firstName}.`
          : ` ${toUser.firstName} Ignored`,
    });
  } catch (error) {
    console.log("error in sending connection request: ", error.message);

    res.status(400).json({
      error: { message: `CONNECTION REQUEST FAILED: ${error.message}` },
    });
  }
});

/**
 * API to accept/reject recived connection requests.
 */
router.post("/review/:status/:requestId", userAuth, async (req, res) => {
  // Validations:
  // 1. Status should be allowed (accepted, ignored)

  // 2. requestId should be valid/present in the connection request collection
  // 3. there should be connection request in interested state for the loggedin user .ie
  // we need to find connection request with id requestId where status is in interested state, and toUserId is same as logged in user id

  try {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;

    // user can only accept or ignore connection request
    const allowedStatus = ["accepted", "ignored"];

    // Status should be allowed (accepted, ignored)
    if (!allowedStatus.includes(status)) {
      throw new Error(`${status} is not a valid status`);
    }

    // requestId should be valid/present in the connection request collection
    // there should be connection request in interested state for the loggedin user .ie
    // we need to find connection request with id requestId where status is in interested state, and toUserId is same as logged in user id
    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested",
    });

    if (!connectionRequest) {
      return res.status(404).json({
        message: "Connection request not found",
      });
    }

    // If connection request is found then update the status from interested to accepted/ignored
    connectionRequest.status = status;

    const response = await connectionRequest.save();

    res
      .status(200)
      .json({ message: `Connection request is ${status}`, data: response });
  } catch (error) {
    console.log(`CONNECTION REQUEST REVIEW ERROR: ${error.message}`);

    res
      .status(400)
      .json({ message: `CONNECTION REQUEST REVIEW ERROR: ${error.message}` });
  }
});

export default router;
