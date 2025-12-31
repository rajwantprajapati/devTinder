import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true }, // String is shorthand for {type: String}
    lastName: String,
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: (props) => `${props.value} is not a valid email!`,
      },
      // OR BELOW
      // validate(value) {
      //   if (!validator.isEmail(value)) {
      //     throw new Error(`${value} is not a valid email`);
      //   }
      // },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: (password) => validator.isStrongPassword(password),
        message: () =>
          `Password should have min 8 characters, atleast 1 lowercase, atleast 1 uppercase and atleast 1 special character`,
      },
    },
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
      validate: {
        validator: (value) => validator.isURL(value),
        message: (props) => `${props.value} is not a valid url!`,
      },
    },
    about: {
      type: String,
      default: "This is default about user",
    },
    skills: [String],
  },
  { timestamps: true },
);

// Re-usable custom schema method to generate JWT token
userSchema.methods.getJWT = function () {
  const user = this;

  const token = jwt.sign({ _id: user._id }, "", { expiresIn: "1d" });

  return token;
};

// Re-usable custom schema method to validate password entered by the user
userSchema.methods.validatePassword = async function (userProvidedPassword) {
  const user = this;
  const hashedPassword = user.password;

  const isValidPassword = await bcrypt.compare(
    userProvidedPassword,
    hashedPassword,
  );

  return isValidPassword;
};

const User = mongoose.model("User", userSchema);

export default User;
