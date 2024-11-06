const express = require("express");
const router = express.Router();
const controller = require("../../controller");
// TOKEN CHECK
//const {protect} = require("../../middleware/auth");

// role level
router.get("/list-event", controller.event.getEvent);
router.post("/create-event", controller.event.createEvent);
router.delete("/delete-event", controller.event.deleteEvent);

// mobile
router.get("/list-event-mobile", controller.event.getEventMobile);
router.post("/create-event-mobile", controller.event.createEventMobile);
router.delete("/delete-event-mobile", controller.event.deleteEventMobile);
module.exports = router;