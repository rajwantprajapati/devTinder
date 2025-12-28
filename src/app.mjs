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
      console.log("signup error: ", eror.message);

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
        throw new Error("User not found!");
      }

      res.status(200).send(user);
    } catch (error) {
      console.log("error in fetching user by email: ", error.message);

      res.status(400).send({
        error: { message: `FETCH BY EMAIL FAILED: ${error.message}` },
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
        throw new Error("User not found!");
      }

      res
        .status(200)
        .send({ message: "User deleted successfully!!", data: deletedUser });
    } catch (error) {
      console.log("error while deleting user by id: ", error.message);

      res.status(400).send({
        error: { message: `DELETE USER FAILED: ${error.message}` },
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
        runValidators: true, // run validations while update as well otherwise validations will only run when creating new document.
      });

      res
        .status(200)
        .send({ message: "User updated successfully!", data: updatedUser });
    } catch (error) {
      console.log("error while updating user: ", error.message);

      res.status(400).send({
        error: { message: `UPDATE FAILED: ${error.message}` },
      });
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
        throw new Error("No user found!");
      }

      res.status(200).send(users);
    } catch (error) {
      console.log("error in fetching users ", error.message);

      res.status(400).send({
        error: { message: `FETCH ALL USERS FAILED: ${error.message}` },
      });
    }
  });

  // NOTE: Server should start listnening to request only after DB is connected
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log("Server is listening at port: ", PORT);
  });
} catch (error) {
  console.log("DB connection failed!!: ", error.message);
}
