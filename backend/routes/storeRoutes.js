const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

router.get("/", auth, role("USER"), storeController.getStores);

module.exports = router;
