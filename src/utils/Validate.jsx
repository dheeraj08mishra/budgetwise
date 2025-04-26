export const checkValidation = (email, password, name) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  const nameRegex = /^[a-zA-Z\s]+$/;

  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }
  if (!passwordRegex.test(password)) {
    return "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number";
  }
  if (name && !nameRegex.test(name)) {
    return "Name can only contain letters and spaces, no numbers or special characters";
  }
  return null;
};
