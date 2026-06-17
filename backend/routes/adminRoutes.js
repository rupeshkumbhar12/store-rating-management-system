const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

router.use(auth, role("ADMIN"));

router.get("/dashboard", adminController.getDashboard);
router.post("/users", adminController.addUser);
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.post("/stores", adminController.addStore);
router.get("/stores", adminController.getStores);

module.exports = router;
