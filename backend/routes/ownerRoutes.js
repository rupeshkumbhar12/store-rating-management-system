const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/ownerController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

router.use(auth, role("OWNER"));

router.get("/average-rating", ownerController.getAverageRating);
router.get("/ratings", ownerController.getRatedUsers);

module.exports = router;
