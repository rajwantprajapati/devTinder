import express from "express";
import { userAuth } from "../middlewares/auth.mjs";

const router = express.Router();

router.get("/send/interested/:userId", userAuth, (req, res) => {
  const user = req.user;

  res
    .status(200)
    .json({ message: `${user.name} sent the connection request.` });
});

export default router;
