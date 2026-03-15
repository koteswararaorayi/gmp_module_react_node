const express = require("express");
const warehouseController = require("../controllers/warehouseController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, warehouseController.getAll);
router.post("/", authenticateToken, warehouseController.create);
router.get("/:id/locations", authenticateToken, warehouseController.getWarehouseLocations);
router.get("/:id/capacity-status", authenticateToken, warehouseController.getCapacityStatus);
router.get("/:id", authenticateToken, warehouseController.getById);
router.put("/:id", authenticateToken, warehouseController.update);
router.delete("/:id", authenticateToken, warehouseController.remove);

module.exports = router;
