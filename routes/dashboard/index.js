const express = require("express");
const router = express.Router();
const controller = require("../../controller");
// TOKEN CHECK
const { protect } = require("../../middleware/auth");

router.post("/mini-dashboard", protect, controller.dashboard.miniDashboard);
router.post("/data-dashboard", protect, controller.dashboard.dataTableDashboard);
router.post("/get-marketing-coordinator", protect, controller.dashboard.getAllMarketingCoordinator)

// Mobile
router.post("/mini-dashboard-mobile", protect, controller.dashboard.miniDashboardMobile);
router.post("/data-dashboard-mobile", protect, controller.dashboard.dataTableDashboardMobile);
router.post("/get-marketing-coordinator-mobile", protect, controller.dashboard.getAllMarketingCoordinatorMobile)

module.exports = router;