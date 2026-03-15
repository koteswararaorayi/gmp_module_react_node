const express = require("express");
const itemTypeController = require("../controllers/itemTypeController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, itemTypeController.getAll);
router.post("/", authenticateToken, itemTypeController.create);
router.get("/:id", authenticateToken, itemTypeController.getById);
router.put("/:id", authenticateToken, itemTypeController.update);
router.delete("/:id", authenticateToken, itemTypeController.remove);

module.exports = router;
