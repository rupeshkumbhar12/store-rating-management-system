const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

router.post("/", auth, role("USER"), ratingController.submitRating);
router.put("/:storeId", auth, role("USER"), ratingController.updateRating);

module.exports = router;
