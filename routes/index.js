const userRole = require("./roleUser/index")
const master = require("./master/index")
const project = require("./project/index")
const marketing = require("./marketing/index")
const event = require("./event/index")
const dashboard = require("./dashboard/index")

module.exports = {
    userRoleRouter: userRole,
    masterRouter: master,
    projectRouter: project,
    marketingRouter: marketing,
    eventRouter: event,
    dashboardRouter: dashboard
};