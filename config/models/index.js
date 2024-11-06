// MODEL AUTH USER
const user = require("./roleUser")
const master = require("./master")
const project = require("./project")
const event = require("./event")

const model = {};

// MODEL USER ROLE
model.mst_role = user.mst_role
model.mst_role_level = user.mst_role_level
model.mst_role_management = user.mst_role_management
model.mst_role_event = user.mst_role_event
model.mst_role_event_parent = user.mst_role_event_parent
model.mst_profile = user.mst_profile
model.structure_organ = user.structure_organ
model.v_mst_marketing = user.v_mst_marketing
model.v_all_profile = user.v_all_profile
model.v_all_structure_organ = user.v_all_structure_organ
model.v_master_role = user.v_master_role
model.detail_location_work = user.detail_location_work
model.v_detail_location_work = user.v_detail_location_work

// MODEL MASTER
model.mst_document = master.mst_document
model.mst_keyword = master.mst_keyword
model.mst_location = master.mst_location
model.mst_procurement_type = master.mst_procurement_type
model.mst_province = master.mst_province
model.mst_status = master.mst_status
model.mst_position = master.mst_position
model.v_location_province = master.v_location_province
model.mst_sub_dis = master.mst_sub_dis
model.history_notification = master.history_notification

// MODEL PROJECT
model.daily_activity = project.daily_activity
model.daily_activity_temp = project.daily_activity_temp
model.detail_file_project = project.detail_file_project
model.detail_file_project_temp = project.detail_file_project_temp
model.detail_file_project_history = project.detail_file_project_history
// model.detail_file_project = project.detail_file_project
// model.detail_file_project_temp = project.detail_file_project_temp
// model.detail_file_project_history = project.detail_file_project_history
model.header_project = project.header_project
model.status_project = project.status_project
model.status_project_temp = project.status_project_temp
model.v_project_detail = project.v_project_detail
model.v_all_project = project.v_all_project
model.v_project_temp_detail = project.v_project_temp_detail
model.v_status_project_temp = project.v_status_project_temp
model.v_status_project = project.v_status_project
model.v_daily_activity = project.v_daily_activity
model.v_daily_activity_temp = project.v_daily_activity_temp
model.v_all_daily_activity = project.v_all_daily_activity
model.v_all_status_project = project.v_all_status_project


//event
model.headerEvent = event.headerEvent
model.detailDateEvent = event.detailDateEvent
model.detailUserInvite = event.detailUserInvite



module.exports = model;

