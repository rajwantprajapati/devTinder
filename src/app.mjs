import express from "express";
import { connectDB } from "./config/database.mjs";
import User from "./models/user.mjs";

const app = express();

// req body parser middleware
app.use(express.json());

try {
  await connectDB();

  console.log("DB Connection Success!!");

  /**
   * Signup API
   * POST /signup - Create new user and save into database
   */
  app.post("/signup", async (req, res) => {
    // Create new instance of user model with req body
    const user = new User(req.body);

    try {
      await user.save();

      res.status(201).send("User signed up successfully!!");
    } catch (eror) {
      console.log("signup error: ", eror);

      res.status(400).send("error while signup!!");
    }
  });

  /**
   * Find User by email id
   * GET /user - get user by email id
   */
  app.get("/user", async (req, res) => {
    const userEmailId = req.body.emailId;

    try {
      const user = await User.findOne({ emailId: userEmailId });

      if (!user) {
        return res.status(404).send({ error: { message: "User not found!" } });
      }

      res.status(200).send(user);
    } catch (error) {
      console.log("error in fetching user by email: ", error);

      res.status(400).send({
        error: { message: "Something went wrong in fetching user by email id" },
      });
    }
  });

  /**
   * Delete user API
   * DELETE /user api - delete user by Id
   */
  app.delete("/user", async (req, res) => {
    const userId = req.body.userId;

    try {
      const deletedUser = await User.findByIdAndDelete(userId); // or {_id: userId}

      if (!deletedUser) {
        return res.status(404).send({ error: { message: "User not found!" } });
      }

      res
        .status(200)
        .send({ message: "User deleted successfully!!", data: deletedUser });
    } catch (error) {
      console.log("error while deleting user by id: ", error);

      res.status(400).send({
        error: { message: "Something went wrong while deleting user by id" },
      });
    }
  });

  /**
   * Update user
   * PATCH /user api - Update user data
   */
  app.patch("/user", async (req, res) => {
    const { userId, data } = req.body;

    try {
      const updatedUser = await User.findByIdAndUpdate(userId, data, {
        returnDocument: "after",
      });

      res
        .status(200)
        .send({ message: "User updated successfully!", data: updatedUser });
    } catch (error) {
      console.log("error while updating user: ", error);

      res.status(400);
    }
  });

  /**
   * Feed API
   * GET /feed - get all the users from database
   */
  app.get("/feed", async (req, res) => {
    try {
      const users = await User.find();

      if (users?.length === 0) {
        return res.status(404).send("No user found!");
      }

      res.status(200).send(users);
    } catch (error) {
      console.log("error in fetching users ", error);

      res.status(400).send({
        error: { message: "Something went wrong in fetching users" },
      });
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
