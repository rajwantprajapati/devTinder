import express from "express";
import { userAuth } from "../middlewares/auth.mjs";
import User from "../models/user.mjs";
import ConnectionRequest from "../models/connectionRequest.mjs";

const router = express.Router();

/**
 * Api to send connection request to another user.
 */
router.post("/send/:status/:userId", userAuth, async (req, res) => {
  try {
    const { status, userId: toUserId } = req.params;
    const { _id: fromUserId, firsName } = req.user;

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

export default router;
