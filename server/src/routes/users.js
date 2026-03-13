const express = require("express");
const userController = require("../controllers/userController");
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

const router = express.Router();

router.get("/profile", authenticateToken, userController.getProfile);
router.put("/profile", authenticateToken, userController.updateProfile);
router.put(
  "/change-password",
  authenticateToken,
  userController.changePassword,
);
router.get(
  "/roles",
  authenticateToken,
  authorizeRole(ROLES.ADMIN, ROLES.MANAGER),
  userController.getRoles,
);
router.get(
  "/login-history",
  authenticateToken,
  userController.getLoginHistory,
);

module.exports = router;
