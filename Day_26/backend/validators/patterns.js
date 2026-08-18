const namePattern = /^[a-zA-Z]{2,}(?:\s[a-zA-Z]{2,})+$/;
const usernamePattern = /^[a-zA-Z\d_]{3,16}$/;
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@&%*+!$])[a-zA-Z\d@&%*+!$]{8,}$/;

module.exports = {
  namePattern,
  usernamePattern,
  emailPattern,
  passwordPattern,
};
