const express = require("express");
const router = express.Router();
const controller = require("../../controller");
// TOKEN CHECK
const { protect } = require("../../middleware/auth");

// role level
router.post("/get-role-level", controller.roleUser.getRoleLevel);
router.get("/role-level-one", controller.roleUser.getRoleLevelOne);
router.post("/add-level", controller.roleUser.addLevel);
router.put("/update-level", controller.roleUser.editLevel)
// role parent
router.post("/get-role-parent", controller.roleUser.getRoleParent)
router.get("/role-parent-one", controller.roleUser.getRoleParentOne)
router.post("/add-parent", controller.roleUser.addRoleParent)
router.put("/update-parent", controller.roleUser.editRoleParent)
// role event
router.post("/get-role-event", controller.roleUser.getRoleEvent)
router.get("/role-event-one", controller.roleUser.getRoleEventOne)
router.post("/add-event", controller.roleUser.addRoleEvent)
router.put("/update-event", controller.roleUser.editRoleEvent)
// role
router.post("/list-role", controller.roleUser.listRole)
router.get("/role-one", controller.roleUser.listRoleOne);
router.post("/add-role", protect, controller.roleUser.addRole)
router.put("/update-role", protect, controller.roleUser.updateRole)
router.delete("/delete-role", protect, controller.roleUser.deleteRole)

// user
router.post("/get-all-user", protect, controller.roleUser.getAllUser)
router.get("/get-one-user", protect, controller.roleUser.getOneUser)
router.delete("/delete-user", protect, controller.roleUser.deleteUser)
router.post("/add-detail-location-work", controller.roleUser.addDetailLocationWork)
router.post("/get-one-detail-location-work", controller.roleUser.getOneDetailLocationWork)
router.post("/get-all-detail-location-work", controller.roleUser.getAllDetailLocationWork)
router.post("/get-location-default", protect, controller.roleUser.getLocationDefault)

// Auth Profile
router.post("/login", controller.roleUser.login)
router.post("/register", protect, controller.roleUser.register)
router.post("/edit-profile", protect, controller.roleUser.editProfile)
router.post("/forget-password", controller.roleUser.forgetPassword)
router.post("/confirm-password", controller.roleUser.confirmPassword)

// Detail Work Marketing
router.put("/update-detail-work", controller.roleUser.updateDetailWork)
router.delete("/delete-detail-work", controller.roleUser.deleteDetailWork)


// Mobile
// role level
router.post("/get-role-level-mobile", controller.roleUser.getRoleLevelMobile);
router.get("/role-level-one-mobile", controller.roleUser.getRoleLevelOneMobile);
router.post("/add-level-mobile", controller.roleUser.addLevelMobile);
router.put("/update-level-mobile", controller.roleUser.editLevelMobile)
// role parent
router.post("/get-role-parent-mobile", controller.roleUser.getRoleParentMobile)
router.get("/role-parent-one-mobile", controller.roleUser.getRoleParentOneMobile)
router.post("/add-parent-mobile", controller.roleUser.addRoleParentMobile)
router.put("/update-parent-mobile", controller.roleUser.editRoleParentMobile)
// role event
router.post("/get-role-event-mobile", controller.roleUser.getRoleEventMobile)
router.get("/role-event-one-mobile", controller.roleUser.getRoleEventOneMobile)
router.post("/add-event-mobile", controller.roleUser.addRoleEventMobile)
router.put("/update-event-mobile", controller.roleUser.editRoleEventMobile)
// role
router.post("/list-role-mobile", controller.roleUser.listRoleMobile)
router.get("/role-one-mobile", controller.roleUser.listRoleOneMobile);
router.post("/add-role-mobile", protect, controller.roleUser.addRoleMobile)
router.put("/update-role-mobile", protect, controller.roleUser.updateRoleMobile)
router.delete("/delete-role-mobile", protect, controller.roleUser.deleteRoleMobile)

// user
router.post("/get-all-user-mobile", protect, controller.roleUser.getAllUserMobile)
router.get("/get-one-user-mobile", protect, controller.roleUser.getOneUserMobile)
router.delete("/delete-user-mobile", protect, controller.roleUser.deleteUserMobile)

// Auth Profile
router.post("/login-mobile", controller.roleUser.loginMobile)
router.post("/register-mobile", protect, controller.roleUser.registerMobile)
router.post("/edit-profile-mobile", protect, controller.roleUser.editProfileMobile)
router.post("/forget-password-mobile", controller.roleUser.forgetPasswordMobile)
router.post("/confirm-password-mobile", controller.roleUser.confirmPasswordMobile)

module.exports = router;