export const validateName = (name) => {
  if (!name || name.length < 20 || name.length > 60) {
    return "Name must be between 20 and 60 characters";
  }
  return "";
};

export const validateAddress = (address) => {
  if (!address || address.length > 400) {
    return "Address is required and must be at most 400 characters";
  }
  return "";
};

export const validateEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!email || !emailRegex.test(email)) {
    return "Invalid email format";
  }
  return "";
};

export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[\W]).{8,16}$/;
  if (!password || !passwordRegex.test(password)) {
    return "Password must be 8-16 chars with 1 uppercase and 1 special character";
  }
  return "";
};

export const validateForm = (fields) => {
  const errors = {};
  if (fields.name !== undefined) {
    const err = validateName(fields.name);
    if (err) errors.name = err;
  }
  if (fields.address !== undefined) {
    const err = validateAddress(fields.address);
    if (err) errors.address = err;
  }
  if (fields.email !== undefined) {
    const err = validateEmail(fields.email);
    if (err) errors.email = err;
  }
  if (fields.password !== undefined) {
    const err = validatePassword(fields.password);
    if (err) errors.password = err;
  }
  return errors;
};
