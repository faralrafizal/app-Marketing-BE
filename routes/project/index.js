const express = require("express");
const router = express.Router();
const controller = require("../../controller");
// TOKEN CHECK
const { protect } = require("../../middleware/auth");

router.post("/get-all-project", protect, controller.project.getAllProject)
router.post("/get-all-project-new", protect, controller.project.getAllProjectNew)
router.post("/get-one-project", protect, controller.project.getOneProject)
router.post("/create-project", protect, controller.project.createProject)
router.delete("/delete-project", protect, controller.project.deleteProject)
router.delete("/delete-project-temp", protect, controller.project.deleteProjectTemp)
router.put("/edit-data-project", protect, controller.project.editDataProject)
router.post("/approve-project", protect, controller.project.approveProject2)
router.post("/approve-status-project", protect, controller.project.approveStatusProject)
router.post("/reject-status-project", protect, controller.project.rejectStatusProject)
router.put("/update-status-project", protect, controller.project.updateStatusProject)
router.post("/check-project-code", protect, controller.project.checkProjectCode)
router.put("/update-project-actual", protect, controller.project.editProjectActual)
router.put("/update-project-temp-history", protect, controller.project.editDataProjectTempHistory)
router.get("/check-project", controller.project.checkEditProject)

// structur organ
router.post("/get-hierarchy-structure", controller.project.getHierarchy)
router.post("/add-structur-organ", protect, controller.project.addStructureOrganArray)
router.put("/edit-structure-organ", protect, controller.project.editStructureOrgan)
router.get("/get-one-structure-organ", controller.project.getOneStructureOrgan)
router.put("/update-up-structure-organ", protect, controller.project.editUpEmployee)
router.put("/update-down-structure-organ", protect, controller.project.editDownEmployee)
router.delete("/delete-structure-organ", protect, controller.project.deleteStrucktur)
router.post("/get-data-structure-filter", protect, controller.project.filterStructureOrgan)

// status project
router.post("/get-all-status-project", protect, controller.project.getAllDataStatusProject)
router.get("/get-one-status-project", controller.project.getOneStatusProject)
router.post("/add-status-project", protect, controller.project.addStatusProject)
router.post("/add-status-bulk", protect, controller.project.addStatusProjectBulk)
router.post("/get-data-status-project", protect, controller.project.getAllStatusProject)
router.get("/check-approve-status-project", controller.project.checkApproveStatusProject)
router.get("/get-progress-detail", protect, controller.project.getProgressDetail)
router.post("/approve-status-project", protect, controller.project.approveStatusProject)
router.post("/approve-status-project-mobile", protect, controller.project.approveStatusProjectMobile)

// daily activity
router.post("/get-all-daily-project", protect, controller.project.getAllDailyActivity)
router.post("/get-all-daily-project-mobile", protect, controller.project.getAllDailyActivityMobile)
router.get("/get-one-daily-activity", protect, controller.project.getOneDailyActivity)
router.post("/add-daily-activity", protect, controller.project.addDailyActivity)
router.post("/approve-daily-activity", protect, controller.project.approvalDailyActivity)
router.post("/reject-daily-activity", protect, controller.project.rejectDailyActivity)
router.put("/update-daily-activity", protect, controller.project.updateDailyActivity)

//
router.post("/get-project-temp-pc", controller.project.findDataProjectTempPC)
router.post("/add-project-temp-api", protect, controller.project.addProjectToTempBulk)
router.post("/add-project-act-api", protect, controller.project.addProjectToActualBulk)
router.post("/add-project-history-api", protect, controller.project.addToHistoryProjectBulk)
router.post("/add-progress-actual-api", protect, controller.project.addProgressBulk)
router.delete("/delete-project-temp-api", protect, controller.project.deleteProjectTemp)
router.delete("/delete-project-actual-api", protect, controller.project.deleteProjectActual)
router.post("/add-projects", protect, controller.project.createProjects)
router.post("/delete-projects", protect, controller.project.deleteProjects)


// Mobile

router.post("/get-all-project-mobile", protect, controller.project.getAllProjectMobile)
router.post("/get-all-project-new-mobile", protect, controller.project.getAllProjectNewMobile)
router.post("/get-one-project-mobile", protect, controller.project.getOneProjectMobile)
router.post("/create-project-mobile", protect, controller.project.createProjectMobile)
router.delete("/delete-project-mobile", protect, controller.project.deleteProjectMobile)
router.delete("/delete-project-temp-mobile", protect, controller.project.deleteProjectTempMobile)
router.put("/edit-data-project-mobile", protect, controller.project.editDataProjectMobile)
router.post("/approve-project-mobile", protect, controller.project.approveProjectMobile)
router.post("/approve-status-project-mobile", protect, controller.project.approveStatusProjectMobile)
router.post("/reject-status-project-mobile", protect, controller.project.rejectStatusProjectMobile)
router.put("/update-status-project-mobile", protect, controller.project.updateStatusProjectMobile)
router.post("/check-project-code-mobile", protect, controller.project.checkProjectCodeMobile)
router.put("/update-project-actual-mobile", protect, controller.project.editProjectActualMobile)

// structur organ
router.post("/get-hierarchy-structure-mobile", controller.project.getHierarchyMobile)
router.post("/add-structur-organ-mobile", protect, controller.project.addStructureOrganArrayMobile)
router.put("/edit-structure-organ-mobile", protect, controller.project.editStructureOrganMobile)
router.get("/get-one-structure-organ-mobile", controller.project.getOneStructureOrganMobile)
router.put("/update-up-structure-organ-mobile", protect, controller.project.editUpEmployeeMobile)
router.put("/update-down-structure-organ-mobile", protect, controller.project.editDownEmployeeMobile)
router.delete("/delete-structure-organ-mobile", protect, controller.project.deleteStruckturMobile)

// status project
router.post("/get-all-status-project-mobile", controller.project.getAllDataStatusProjectMobile)
router.get("/get-one-status-project-mobile", controller.project.getOneStatusProjectMobile)
router.post("/add-status-project-mobile", protect, controller.project.addStatusProjectMobile)
router.post("/add-status-bulk-mobile", protect, controller.project.addStatusProjectBulkMobile)
router.post("/get-data-status-project-mobile", protect, controller.project.getAllStatusProjectMobile)
router.get("/check-approve-status-project-mobile", controller.project.checkApproveStatusProjectMobile)
router.get("/get-progress-detail-mobile", protect, controller.project.getProgressDetailMobile)

// daily activity
router.post("/get-all-daily-project-mobile", protect, controller.project.getAllDailyActivityMobile)
router.get("/get-one-daily-activity-mobile", protect, controller.project.getOneDailyActivityMobile)
router.post("/add-daily-activity-mobile", protect, controller.project.addDailyActivityMobile)
router.post("/approve-daily-activity-mobile", protect, controller.project.approvalDailyActivityMobile)
router.post("/reject-daily-activity-mobile", protect, controller.project.rejectDailyActivityMobile)

//
router.post("/get-project-temp-pc-mobile", controller.project.findDataProjectTempPCMobile)
router.post("/add-project-temp-api-mobile", protect, controller.project.addProjectToTempBulkMobile)
router.post("/add-project-act-api-mobile", protect, controller.project.addProjectToActualBulkMobile)
router.post("/add-project-history-api-mobile", protect, controller.project.addToHistoryProjectBulkMobile)
router.post("/add-progress-actual-api-mobile", protect, controller.project.addProgressBulkMobile)
router.delete("/delete-project-temp-api-mobile", protect, controller.project.deleteProjectTempMobile)
router.delete("/delete-project-actual-api-mobile", protect, controller.project.deleteProjectActualMobile)
router.post("/add-projects-mobile", protect, controller.project.createProjectsMobile)
router.post("/delete-projects-mobile", protect, controller.project.deleteProjectsMobile)

router.get('/check-code', controller.project.checkCode)
module.exports = router;