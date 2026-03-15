const express = require("express");
const supplierController = require("../controllers/supplierController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, supplierController.getAll);
router.post("/", authenticateToken, supplierController.create);
router.get("/:id", authenticateToken, supplierController.getById);
router.put("/:id", authenticateToken, supplierController.update);
router.delete("/:id", authenticateToken, supplierController.remove);

module.exports = router;
