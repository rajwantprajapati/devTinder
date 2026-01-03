import mongoose from "mongoose";
const { Schema } = mongoose;

const connectionRequestSchema = new Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: "${VALUE} is not valid status type",
      },
      required: true,
    },
  },
  { timestamps: true },
);

// create compound index for better search performance
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

// Add a validation before saving the data
connectionRequestSchema.pre("save", function (next) {
  return new Promise((resolve, reject) => {
    const connectionRequest = this;

    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
      reject(new Error("You can not send request to yourself."));
    }

    resolve();
  });
});

const ConnectionRequestModel = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema,
);

export default ConnectionRequestModel;
