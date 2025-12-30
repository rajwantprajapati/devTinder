import validator from "validator";

export const validateSignUpData = (reqPayload) => {
  const { firstName, lastName, emailId, password } = reqPayload;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid!");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email id is not valid!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password should have min 8 characters, atleast 1 lowercase, atleast 1 uppercase and atleast 1 special character",
    );
  }
};
