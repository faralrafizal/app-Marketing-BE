const express = require("express");
const router = express.Router();
const controller = require("../../controller");
// TOKEN CHECK
const { protect } = require("../../middleware/auth");

router.post("/get-document", protect, controller.masterUser.getAllMstDoc);
router.get("/get-one-document", controller.masterUser.getOneMstDoc);
router.post("/get-all-procurement-type", protect, controller.masterUser.getAllProcurementType)
router.get("/get-one-procurement-type", protect, controller.masterUser.getOneProcurementType)
router.post("/get-all-location", protect, controller.masterUser.getListLocation)
router.post("/get-all-location-city", protect, controller.masterUser.getAllLocationCity)
router.post("/get-all-keyword", protect, controller.masterUser.getAllKeyword)
router.post("/get-all-subdis", protect, controller.masterUser.getAllSubdis)
router.get("/get-one-subdis", protect, controller.masterUser.getOneSubdis)
router.post("/get-all-position", protect, controller.masterUser.getAllPosition)
router.get("/get-one-position", protect, controller.masterUser.getOnePosition)
router.post("/create-subdis", protect, controller.masterUser.createSubdis)
router.post("/update-subdis", protect, controller.masterUser.editSubdis)
router.post("/delete-subdis", protect, controller.masterUser.deleteSubdis)
router.post("/get-all-status", protect, controller.masterUser.getAllStatus)
router.get("/check-document", controller.masterUser.checkDocument)
router.get("/template", controller.masterUser.getTemplate)
//Notif
router.put("/read-notification", controller.masterUser.readAtHistoryNotif)
router.get("/notifications", protect, controller.masterUser.getDataNotification)
router.get("/one-notification", protect, controller.masterUser.getOneDataNotification )

// Keyword
router.get("/get-one-keyword", protect, controller.masterUser.getOneKeyword)
router.post("/add-keyword", protect, controller.masterUser.addKeyword)
router.delete("/delete-keyword", protect, controller.masterUser.deleteKeyword)
router.put("/edit-keyword", protect, controller.masterUser.editKeyword)

// Procurement_type
//router.get("/get-one-procurement-type", protect, controller.masterUser.getOneProcurementType)
router.post("/add-procurement-type", protect, controller.masterUser.addProcurementType)
router.delete("/delete-procurement-type", protect, controller.masterUser.deleteProcurementType)
router.put("/edit-procurement-type", protect, controller.masterUser.editProcurement)

// Location
router.get("/get-one-location", protect, controller.masterUser.getOneLocation)
router.post("/add-location", protect, controller.masterUser.addLocation)
router.post("/get-all-province", protect, controller.masterUser.getAllProvince)
router.delete("/delete-location", protect, controller.masterUser.deleteLocation)
router.put("/edit-location", protect, controller.masterUser.editLocation)

// Mobile
router.post("/get-document-mobile", protect, controller.masterUser.getAllMstDocMobile);
router.get("/get-one-document-mobile", protect, controller.masterUser.getOneMstDocMobile);
router.post("/get-all-procurement-type-mobile", protect, controller.masterUser.getAllProcurementTypeMobile)
router.get("/get-one-procurement-type-mobile", protect, controller.masterUser.getOneProcurementTypeMobile)
router.post("/get-all-location-mobile", protect, controller.masterUser.getListLocationMobile)
router.post("/get-all-location-city-mobile", protect, controller.masterUser.getAllLocationCityMobile)
router.post("/get-all-keyword-mobile", protect, controller.masterUser.getAllKeywordMobile)
router.post("/get-all-subdis-mobile", protect, controller.masterUser.getAllSubdisMobile)
router.get("/get-one-subdis-mobile", protect, controller.masterUser.getOneSubdisMobile)
router.post("/create-subdis-mobile", protect, controller.masterUser.createSubdisMobile)
router.post("/update-subdis-mobile", protect, controller.masterUser.editSubdisMobile)
router.post("/delete-subdis-mobile", protect, controller.masterUser.deleteSubdisMobile)
router.post("/get-all-status-mobile", protect, controller.masterUser.getAllStatusMobile)
//Notif Mobile
router.put("/read-notification-mobile", controller.masterUser.readAtHistoryNotifMobile)
router.get("/notifications-mobile", controller.masterUser.getDataNotificationMobile)
router.get("/one-notification-mobile", protect, controller.masterUser.getOneDataNotificationMobile)

module.exports = router;