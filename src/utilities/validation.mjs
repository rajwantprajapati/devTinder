import validator from "validator";

/**
 * Method to validate sign up api req payload
 */
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

/**
 * Method to validate profile update api req payload
 */
export const validateUpdateProfileData = (reqPayload) => {
  const ALLOWED_EDIT_FIELDS = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "photoUrl",
    "about",
    "skills",
  ];

  const isUpdateAllowed = Object.keys(reqPayload).every((key) =>
    ALLOWED_EDIT_FIELDS.includes(key),
  );

  return isUpdateAllowed;
};
