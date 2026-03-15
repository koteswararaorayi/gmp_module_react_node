const express = require("express");
const itemController = require("../controllers/itemController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Export must be registered before /:id to avoid collision
router.get("/export", authenticateToken, itemController.exportItems);

router.get("/", authenticateToken, itemController.getAll);
router.post("/", authenticateToken, itemController.create);
router.get("/:id", authenticateToken, itemController.getById);
router.put("/:id", authenticateToken, itemController.update);
router.delete("/:id", authenticateToken, itemController.remove);

module.exports = router;
