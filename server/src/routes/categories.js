const express = require("express");
const categoryController = require("../controllers/categoryController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, categoryController.getAll);
router.post("/", authenticateToken, categoryController.create);
router.get("/:id", authenticateToken, categoryController.getById);
router.put("/:id", authenticateToken, categoryController.update);
router.delete("/:id", authenticateToken, categoryController.remove);

module.exports = router;
