const express = require("express");
const router = express.Router();
const controller = require("../../controller");
// TOKEN CHECK
const { protect } = require("../../middleware/auth");

router.post("/get-all-marketing", protect, controller.marketing.getAllMarketing)

router.post("/get-data-coordinator", controller.marketing.getDataCoordinator)

router.post("/get-data-marketing", controller.marketing.getDataMarketingCoordinator)

router.post("/get-all-marketing-mobile", protect, controller.marketing.getAllMarketingMobile)

router.post("/get-data-coordinator-mobile", controller.marketing.getDataCoordinatorMobile)

router.post("/get-data-marketing-mobile", controller.marketing.getDataMarketingCoordinatorMobile)

router.post("/find-data-coordinator", controller.marketing.findDataCoordinator)

router.post("/find-data-marketing", controller.marketing.findDataMarketingCoordinator)

router.get("/find-detail-location-work", controller.marketing.getMarketingCoordinatorLocation)

module.exports = router;