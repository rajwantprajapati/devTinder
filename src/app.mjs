import express from "express";
import { connectDB } from "./config/database.mjs";
import User from "./models/user.mjs";

const app = express();

try {
  await connectDB();

  console.log("DB Connection Success!!");

  app.post("/signup", async (req, res) => {
    const userData = {
      firstName: "Rajwant",
      lastName: "Prajapati",
      email: "rajwant@gmail.com",
      age: "34",
      geneder: "M",
    };

    const user = new User(userData);

    try {
      await user.save();

      res.status(201).send("User signed up successfully!!");
    } catch (eror) {
      console.log("signup error: ", eror);

      res.status(400).send("error while signup!!");
    }
  });

  // NOTE: Server should start listnening to request only after DB is connected
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log("Server is listening at port: ", PORT);
  });
} catch (error) {
  console.log("DB connection failed!!: ", error);
}
