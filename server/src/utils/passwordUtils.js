const bcrypt = require("bcryptjs");

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

function validatePasswordStrength(password) {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  return {
    valid:
      checks.minLength &&
      checks.hasUppercase &&
      checks.hasLowercase &&
      checks.hasNumber,
    checks,
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
};
