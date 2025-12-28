import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true }, // String is shorthand for {type: String}
    lastName: String,
    emailId: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    age: { type: Number, min: [18, "Age should be more than 18"] },
    gender: {
      type: String,
      enum: {
        values: ["Male", "Female", "Others"],
        message: "{VALUE} is not a valid Gender",
      },
      // OR below
      // validate(value) {
      //   if (!["male", "female", "others"].includes(value)) {
      //     throw new Error("Gender validation failed!");
      //   }
      // },
    },
    photoUrl: {
      type: String,
      default:
        "https://t4.ftcdn.net/jpg/06/59/57/65/360_F_659576586_9CSUewJar5TZDkEMJu3qHVaPJmywlDn1.jpg",
    },
    about: {
      type: String,
      default: "This is default about user",
    },
    skills: [String],
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
