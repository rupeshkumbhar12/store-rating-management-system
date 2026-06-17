const validateName = (name) => {
  if (!name || name.length < 20 || name.length > 60) {
    return "Name must be between 20 and 60 characters";
  }
  return null;
};

const validateAddress = (address) => {
  if (!address || address.length > 400) {
    return "Address is required and must be at most 400 characters";
  }
  return null;
};

const validateEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!email || !emailRegex.test(email)) {
    return "Invalid email format";
  }
  return null;
};

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[\W]).{8,16}$/;
  if (!password || !passwordRegex.test(password)) {
    return "Password must be 8-16 characters with 1 uppercase letter and 1 special character";
  }
  return null;
};

const validateRegistration = (data) => {
  const errors = [];
  const nameError = validateName(data.name);
  const addressError = validateAddress(data.address);
  const emailError = validateEmail(data.email);
  const passwordError = validatePassword(data.password);

  if (nameError) errors.push(nameError);
  if (addressError) errors.push(addressError);
  if (emailError) errors.push(emailError);
  if (passwordError) errors.push(passwordError);

  return errors;
};

module.exports = {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
  validateRegistration,
};
