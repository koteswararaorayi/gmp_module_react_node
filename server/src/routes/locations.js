const express = require("express");
const warehouseController = require("../controllers/warehouseController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, warehouseController.getLocations);
router.post("/", authenticateToken, warehouseController.createLocation);
router.get("/:id", authenticateToken, warehouseController.getLocationById);
router.put("/:id", authenticateToken, warehouseController.updateLocation);
router.delete("/:id", authenticateToken, warehouseController.removeLocation);

module.exports = router;
