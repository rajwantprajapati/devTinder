import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://rajwant:rajwant@devtinder.28whu29.mongodb.net/devTinder",
  );
};
