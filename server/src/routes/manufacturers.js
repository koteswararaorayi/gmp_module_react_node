const express = require("express");
const manufacturerController = require("../controllers/manufacturerController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, manufacturerController.getAll);
router.post("/", authenticateToken, manufacturerController.create);
router.get("/:id", authenticateToken, manufacturerController.getById);
router.put("/:id", authenticateToken, manufacturerController.update);
router.delete("/:id", authenticateToken, manufacturerController.remove);

module.exports = router;
