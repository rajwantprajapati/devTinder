import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://<username>:<password>@devtinder.28whu29.mongodb.net/devTinder",
  );
};
