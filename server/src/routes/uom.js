const express = require("express");
const uomController = require("../controllers/uomController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, uomController.getAll);
router.post("/", authenticateToken, uomController.create);
router.get("/:id", authenticateToken, uomController.getById);
router.put("/:id", authenticateToken, uomController.update);
router.delete("/:id", authenticateToken, uomController.remove);

module.exports = router;
