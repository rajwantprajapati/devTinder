import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: String, // String is shorthand for {type: String}
  lastName: String,
  emailId: String,
  password: String,
  age: String,
  gender: String,
});

const User = mongoose.model("User", userSchema);

export default User;
