const roleUser = require("./roleUser/index")
const masterUser = require("./master/index")
const project = require("./project/index")
const marketing = require("./marketing/index")
const event = require("./event/index")
const dashboard = require("./dashboard/index")
const controller = {};

controller.roleUser = roleUser;
controller.masterUser = masterUser;
controller.project = project;
controller.marketing = marketing;
controller.event = event;
controller.dashboard = dashboard;

module.exports = controller;