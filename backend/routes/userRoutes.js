const express = require("express");
const router = express.Router();
const { getUserDashboard } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, getUserDashboard); //Dimitra

module.exports = router;