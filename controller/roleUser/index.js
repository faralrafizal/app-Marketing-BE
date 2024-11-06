const path = require("path");
const asynco = require("async");
const axios = require("axios").default;
const nodemailer = require("nodemailer");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const { QueryTypes } = require('sequelize');
const generatePassword = require("password-generator")

//database
const db = require("../../config/database/database");
const fs = require("fs");
const model = require("../../config/models/index");
const jwt = require("jsonwebtoken");
const ErrorResponse = require("../../utils/errorResponse")
const responseStatus = require("../../utils/responseStatus")
const { encrypt, decrypt } = require("../../utils/bcrypt");
const { groupBy } = require("../../utils/groupBy");
let ejs = require("ejs");
const socketApi = require("../../middleware/socketApi");

const controller = {}

// Role level (Done)
controller.getRoleLevel = async (req, res, next) => {
    let { page, size, lang, searchWord } = req.query
    // list level
    //await db.open();
    try {
        let number = (page - 1) * size;
        let getPagination = (page, size) => {
            const limit = size ? +size : 0;
            const offset = page ? 0 + (page - 1) * limit : 0;
            return { limit, offset };
        };
        let limit = getPagination(page, size).limit;
        let offset = getPagination(page, size).offset;

        let search = {
            // limit,
            // offset,
            where: {
                // [Op.or]: [
                // ]
            },
            logging: console.log
        }

        if (limit != 0 && offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("level_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                // { ROLE_NAME: { $like: `${searchWord}%`} }
            )
        }

        let dataLevel = await model.mst_role_level.findAndCountAll(search)
        console.log(dataLevel)
        if (dataLevel.rows.length > 0) {
            responseStatus.resOK(res, dataLevel);
        } else {
            responseStatus.resNotFound(res, "Data role level Empty");
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
    // finally{
    //     await db.close();
    // }   
}

controller.getRoleLevelOne = async (req, res, next) => {
    let { id_level } = req.query
    try {
        let dataLevel = await model.mst_role_level.findOne({
            where: {
                id_role_level: id_level
            },
        })
        if (dataLevel) {
            responseStatus.resOK(res, dataLevel);
        } else {
            responseStatus.resNotFound(res, "Data role level Not Found");
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
    // finally {
    //     await db.close();
    // }
}

controller.addLevel = async (req, res, next) => {
    let { id_level } = req.query
    let { level_name } = req.body
    console.log("masuk sini")
    try {
        const levelProcedure = "CALL insert_mst_role_level(:level_name)";
        const parameter = {
            level_name: level_name
        }
        db.query(levelProcedure, {
            replacements: parameter,
            type: Sequelize.QueryTypes.RAW, // Use RAW query type for stored procedures
        })
            .then((results) => {
                console.log('Procedure executed successfully:', results);
                return responseStatus.resCreated(res, parameter)
            })
            .catch((error) => {
                console.log(error, "-")
                if (error.name === "SequelizeDatabaseError") {
                    return responseStatus.resNotAcceptable(res, "Level Name is Already Exist");
                } else {
                    return responseStatus.resInternalServerError(res, error);
                }
            });
    } catch (error) {
        console.log(error);
        next(error)
    }
}

controller.editLevel = async (req, res, next) => {
    let { id_level } = req.query
    let { level_name } = req.body
    try {
        const result = await db.query(
            'SELECT update_mst_role_level(:p_id_role_level, :level_name) as result_text',
            {
                replacements: {
                    p_id_role_level: id_level,
                    level_name: level_name
                },
                type: Sequelize.QueryTypes.SELECT,
            }
        )
            .then((results) => {
                console.log(results)
                if (results[0].result_text === 'Data updated successfully') {
                    return responseStatus.resCreated(res, results);
                } else if (results[0].result_text === 'Level Name is Already Exist') {
                    return responseStatus.resNotAcceptable(res, results);
                } else {
                    return responseStatus.resNotFound(res, results);
                }

            })
            .catch((error) => {
                next(error)
            });
    } catch (error) {
        console.log(error, "masuk sini");
        next(error)
    }
    // finally{
    //     await db.close();
    // }
}

// role event parent (Done)

controller.getRoleParent = async (req, res, next) => {
    let { page, size, lang, searchWord, system } = req.query

    // list level parent
    try {
        // let number = (page - 1) * size;
        // let getPagination = (page, size) => {
        // const limit = size ? +size : 0;
        // const offset = page ? 0 + (page - 1) * limit : 0;
        // return { limit, offset };
        // };
        // let limit = getPagination(page, size).limit;
        // let offset = getPagination(page, size).offset;

        let dataSystem = []
        if (system == "Web") {
            dataSystem = ["Web", "General"]
        } else if (system == "Mobile") {
            dataSystem = ["Mobile", "General"]
        } else {
            dataSystem = ["Web", "Mobile", "General"]
        }

        let search = {
            // limit,
            // offset,
            where: {
                [Op.and]: [
                    { system: dataSystem },
                    //{ [Op.or]: [] }
                ]
            },
            include: [
                {
                    model: model.mst_role_event,
                    attributes: [["event", "event"], ["id_role_event", "id_role_event"]]
                }
            ],
            logging: console.log
        }


        if (searchWord) {
            search.where[Op.and].push({ [Op.or]: [] })
            search.where[Op.and][1][Op.or].push(
                db.where(db.fn("lower", db.col("parent_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("system")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                })
                // { ROLE_NAME: { $like: `${searchWord}%`} }
            )
        }

        let dataParent = await model.mst_role_event_parent.findAll(search)
        console.log(JSON.stringify(dataParent))
        if (dataParent.length > 0) {
            dataParent.map((val) => {
                val.dataValues.type = 'Parent'
                if (val.dataValues.mst_role_event.length > 0) {
                    val.dataValues.mst_role_event.map((index) => {
                        index.dataValues.type = 'Child'
                    })
                }
            })
            responseStatus.resOK(res, dataParent);
        } else {
            responseStatus.resNotFound(res, "Data role Parent Empty");
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
    // finally{
    //     await db.close();
    // }   
}

controller.getRoleParentOne = async (req, res, next) => {
    let { id_parent } = req.query
    try {
        let dataParent = await model.mst_role_event_parent.findOne({
            where: {
                id_role_event_parent: id_parent
            },
        })
        if (dataParent) {
            responseStatus.resOK(res, dataParent);
        } else {
            responseStatus.resNotFound(res, "Data role level Not Found");
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
    // finally {
    //     await db.close();
    // }
}

controller.addRoleParent = async (req, res, next) => {
    let { parent_name, system } = req.body
    try {
        let parameter = {
            parent_name: parent_name,
            system: system
        }
        await db.query(
            'CALL insert_mst_role_event_parent(:parent_name, :system)',
            {
                replacements: parameter,
                type: Sequelize.QueryTypes.RAW,
            }
        )
            .then((results) => {
                console.log('Procedure executed successfully:', results);
                return responseStatus.resCreated(res, parameter)
            })
            .catch((error) => {
                if (error.name === "SequelizeDatabaseError") {
                    return responseStatus.resNotAcceptable(res, "Parent Name is Already Exist");
                } else {
                    return responseStatus.resInternalServerError(res, error);
                }
            });
    } catch (error) {
        console.log(error, "masuk sini");
        next(error)
    }
    // finally{
    //     await db.close();
    // }
}

controller.editRoleParent = async (req, res, next) => {
    let { id_parent } = req.query
    let { parent_name, system } = req.body
    try {
        const result = await db.query(
            'SELECT update_mst_role_event_parent(:p_id_role_event_parent, :p_parent_name, :p_system) as result_text',
            {
                replacements: {
                    p_id_role_event_parent: id_parent,
                    p_parent_name: parent_name,
                    p_system: system
                },
                type: Sequelize.QueryTypes.SELECT,
            }
        )
            .then((results) => {
                console.log(results)
                if (results[0].result_text === 'Data updated successfully') {
                    return responseStatus.resCreated(res, results);
                } else if (results[0].result_text === 'Parent Event is Already Exist') {
                    return responseStatus.resNotAcceptable(res, results);
                } else {
                    return responseStatus.resNotFound(res, results);
                }
            })
            .catch((error) => {
                next(error)
            });
    } catch (error) {
        console.log(error, "masuk sini");
        next(error)
    }
    // finally{
    //     await db.close();
    // }
}

// role event (Done)
controller.getRoleEvent = async (req, res, next) => {
    let { page, size, lang, searchWord } = req.query
    try {
        let number = (page - 1) * size;
        let getPagination = (page, size) => {
            const limit = size ? +size : 0;
            const offset = page ? 0 + (page - 1) * limit : 0;
            return { limit, offset };
        };
        let limit = getPagination(page, size).limit;
        let offset = getPagination(page, size).offset;

        let search = {
            // limit,
            // offset,
            where: {
                // [Op.or]: [
                // ]
            },
            logging: console.log
        }

        if (limit != 0 && offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("event")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                // { ROLE_NAME: { $like: `${searchWord}%`} }
            )
        }
        let dataEvent = await model.mst_role_event.findAndCountAll(search)
        if (dataEvent.rows.length > 0) {
            responseStatus.resOK(res, dataEvent);
        } else {
            responseStatus.resNotFound(res, "Data role event Empty");
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
    // finally {
    //     await db.close();
    // }
}
controller.getRoleEventOne = async (req, res, next) => {
    let { id_role_event } = req.query
    try {
        let dataEvent = await model.mst_role_event.findOne({
            include: [
                { model: model.mst_role_event_parent }
            ],
            where: {
                id_role_event: id_role_event
            }
        })
        if (dataEvent) {
            responseStatus.resOK(res, dataEvent);
        } else {
            responseStatus.resNotFound(res, "Data role Event Not Found");
        }
    } catch (error) {
        next(error)
    }
    // finally {
    //     await db.close()
    // }
}
controller.addRoleEvent = async (req, res, next) => {
    let { id_parent, event } = req.body
    try {
        let parameter = {
            p_event: event,
            p_id_event_parent: id_parent
        }
        await db.query(
            'CALL insert_mst_role_event(:p_event, :p_id_event_parent)',
            {
                replacements: parameter,
                type: Sequelize.QueryTypes.RAW,
            }
        )
            .then((results) => {
                console.log('Procedure executed successfully:', results);
                return responseStatus.resCreated(res, parameter)
            })
            .catch((error) => {
                if (error.name === "SequelizeDatabaseError") {
                    return responseStatus.resNotAcceptable(res, "Event is Already Exist");
                } else {
                    return responseStatus.resInternalServerError(res, error);
                }
            });
    } catch (error) {
        console.log(error)
        next(error)
    }
    // finally {
    //     await db.close;
    // }
}
controller.editRoleEvent = async (req, res, next) => {
    let { id_event } = req.query
    let { event, id_parent } = req.body
    try {
        const result = await db.query(
            'SELECT update_mst_role_event(:p_id_role_event, :p_event, :p_id_parent) as result_text',
            {
                replacements: {
                    p_id_role_event: id_event,
                    p_event: event,
                    p_id_parent: id_parent
                },
                type: Sequelize.QueryTypes.SELECT,
            }
        )
            .then((results) => {
                console.log(results)
                if (results[0].result_text === 'Data updated successfully') {
                    return responseStatus.resCreated(res, results);
                } else if (results[0].result_text === 'Event is Already Exist') {
                    return responseStatus.resNotAcceptable(res, results);
                } else {
                    return responseStatus.resNotFound(res, results);
                }
            })
            .catch((error) => {
                next(error)
            });
    } catch (error) {
        console.log(error, "masuk sini");
        next(error)
    }
    // finally{
    //     await db.close();
    // }
}

// role management

controller.listRole = async (req, res, next) => {
    let {
        distinct, page, size, searchWord, lang
    } = req.query;

    let number = (page - 1) * size;
    let getPagination = (page, size) => {
        const limit = size ? +size : 0;
        const offset = page ? 0 + (page - 1) * limit : 0;
        return { limit, offset };
    };
    let limit = getPagination(page, size).limit;
    let offset = getPagination(page, size).offset;

    try {
        let search = {
            // limit,
            // offset,
            where: {
                // [Op.or]: [
                // ]
            },
            logging: console.log
        }

        if (limit != 0 || offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("role_name")), {
                    [Op.like]: `%${searchWord}%`,
                }),
            )
        }

        let checkRole = await model.mst_role.findAndCountAll(search)

        let data = await model.mst_role_level.findAll()
        console.log("data.....")
        const findLevel = (id) => data.find((val) =>
            val.dataValues.id_role_level == id
        );

        for (let i = 0; i < checkRole.rows.length; i++) {
            let level = findLevel(checkRole.rows[i].dataValues.id_role_event)

            checkRole.rows[i].dataValues.mst_role_level = level
        }

        // console.log(checkRole)
        if (checkRole.rows.length > 0) {
            res.status(200).json({
                code: "1",
                msg: lang == "en" ? "Success Read Data" : "Berhasil Membaca Data",
                checkRole,
            });
        } else {
            throw new ErrorResponse("Data Role is null", 404);
        }
    } catch (error) {
        next(error)
    }
    // finally{
    //     await db.close();
    // }
}
controller.listRoleOne = async (req, res, next) => {
    let { id_role, lang } = req.query

    try {
        var result = {}
        let findDataRole = await model.mst_role.findOne({
            where: {
                id_role: id_role
            },
        })
        let dataRole = findDataRole.dataValues
        let findRoleLevel = await model.mst_role_level.findOne({
            where: {
                id_role_level: dataRole.id_role_level
            },
            attributes: [["level_name", "level_name"]]
        })
        result.id_role = dataRole.id_role
        result.role_name = dataRole.role_name
        result.id_role_level = dataRole.id_role_level
        result.level_name = findRoleLevel.dataValues.level_name
        result.system = dataRole.system

        if (findDataRole) {

            let roleManagement = await model.mst_role_management.findAll({
                where: {
                    id_role: dataRole.id_role
                },
                include: [
                    { model: model.mst_role_event }
                ]
            })

            var id_role_event_parent = []
            var module = []
            var list = []

            const findReference = (id) => module.findIndex((ref, i) => ref.id_role_event_parent == id);

            for (let i = 0; i < roleManagement.length; i++) {
                let management = roleManagement[i].dataValues
                let event = management.mst_role_event.dataValues
                let parent = event.id_role_event_parent

                let find = findReference(parent)
                console.log(find, "nialai find.......")
                list.push({ value: management.id_role_event, label: event.event, roleManagementId: management.id_role_management })
                console.log(module, "nilai mmmmmmmmmmmmmmmmmmm")

                if (find >= 0) {

                    module[find].module.push({ value: management.id_role_event, label: event.event, roleManagementId: management.id_role_management })
                } else {
                    id_role_event_parent.push(parent)
                    let idParent = await model.mst_role_event_parent.findOne({
                        where: {
                            id_role_event_parent: parent
                        }, attributes: [["parent_name", "parent_name"]]
                    })
                    module.push({ id_role_event_parent: parent, parent_name: idParent.dataValues.parent_name, module: [{ value: management.id_role_event, label: event.event, roleManagementId: management.id_role_management }] })

                }
            }
            result.modules = module
            result.list = list

            res.status(200).json({
                code: "1",
                msg: "Success Read Data",
                result,
            });
        } else {
            throw new ErrorResponse("Data Role not found", 404);
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
    // finally {
    //     await db.close();
    // }
}
controller.updateRole = async (req, res, next) => {
    let { roleId, lang } = req.query
    let { idLevel, roleName, module, system } = req.body


    const transUpdate = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    try {
        let detailRole = await model.mst_role.findOne({
            include: [
                {
                    model: model.mst_role_management
                },
            ],
            where: { id_role: roleId }
        })
        if (idLevel || roleName) {
            let updateRole = await model.mst_role.update({ id_role_level: idLevel, role_name: roleName, system: system }, { where: { id_role: roleId } })
            if (updateRole != 1) throw new ErrorResponse("Update Error", 400);
        }
        module = JSON.parse(module)

        const findReference = (ids) => module.find((ref) => ref.roleManagementId == ids);
        let idDelete = []

        let roleManag = detailRole.dataValues.mst_role_management
        console.log(detailRole)
        for (let i = 0; i < roleManag.length; i++) {
            // console.log(data, "nilai dayajsiajsiih")
            let data = findReference(roleManag[i].dataValues.id_role_management)
            if (!data) {
                idDelete.push(roleManag[i].dataValues.id_role_management)
            }
            // console.log(data, "nilai dayajsiajsiih")
        }
        if (idDelete.length > 0) {
            let deleteID = await model.mst_role_management.destroy({
                where: {
                    id_role_management: { [Op.or]: idDelete }
                }
            })
            if (deleteID != 1) throw new ErrorResponse("Update Error", 400);
        }
        for (let j = 0; j < module.length; j++) {
            let data = module[j]
            // console.log(data.idEvent, "cobaksoasj")
            if (!data.roleManagementId) {
                let insert = await model.mst_role_management.create({
                    id_role: roleId, id_role_event: data.idEvent
                })
                if (!insert) throw new ErrorResponse("Update Error", 400);
            }
        }
        res.status(201).json({
            code: "1",
            msg: lang == "en" ? "Success Update Data" : "Berhasil memperbarui data",
        });


    } catch (error) {
        console.log(error)
        if (transUpdate && !transUpdate.finished) await transUpdate.rollback();
        next(error)
    }
    // finally {
    //     await db.close();
    // }
}
controller.addRole = async (req, res, next) => {
    let { roleId, lang } = req.query
    let { idLevel, idPort, idTerminal, idCompany, roleName, module, system } = req.body



    // idLevel = 3
    // module = "[{\"idEvent\":1}]"
    // roleName = "Test1"
    // system = "Web" // ini bisa "Mobile" // kalo milih 2 "General"

    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    let search = {
        where: {
            [Op.and]: [
                { role_name: roleName },
                { id_role_level: idLevel },
                { system: system }
            ]
        }
    }

    try {
        let checkRole = await model.mst_role.findOne(search)
        console.log(checkRole, "module......")
        if (checkRole) throw new ErrorResponse("Data role is already Exist", 406);
        let createRole = await model.mst_role.create({
            role_name: roleName,
            id_role_level: idLevel,
            system: system

        }, { transaction: t })

        let findCreateModule = await model.mst_role.findOne({
            where: {
                [Op.and]: [
                    { role_name: roleName },
                    { id_role_level: idLevel }
                ]
            },
            transaction: t
        })
        if (module) {
            module = JSON.parse(module)
            console.log(module, "module......")
            /*
            '[{idEvent : "08"},{idEvent : "09"}]'
            */
            if (module.length > 0) {
                console.log(createRole, "=====================");
                console.log(findCreateModule, "findCreateModule=====================");
                let valueAdd = []
                for (let i = 0; i < module.length; i++) {
                    let findRoleModule = await model.mst_role_management.findOne({
                        where: {
                            [Op.and]: [
                                { id_role: findCreateModule.id_role },
                                { id_role_event: module[i].idEvent }
                            ]
                        }
                    })
                    console.log(findRoleModule, "module semua......")
                    if (findRoleModule) throw new ErrorResponse("Data role is already Exist", 406);

                    if (module[i].idEvent) {
                        let find = valueAdd.find((item) => item.id_role === findCreateModule.id_role && item.id_role_event === module[i].idEvent)

                        if (!find) {
                            valueAdd.push({
                                id_role: findCreateModule.id_role,
                                id_role_event: module[i].idEvent
                            })
                        } else {
                            throw new ErrorResponse("Value cannot be same", 406);
                        }
                    } else {
                        throw new ErrorResponse("Please complete data", 406);
                    }
                }
                if (valueAdd.length > 0) {
                    var dataAddRoleModule = await model.mst_role_management.bulkCreate(valueAdd, { transaction: t })
                }
            }
            await t.commit()
            res.status(201).json({
                code: "1",
                msg: lang == "en" ? "Success Create Data" : "Berhasil Membuat Data",
                dataAddRoleModule
            });
        }
    } catch (error) {
        console.log(error)
        if (t && !t.finished) await t.rollback();
        next(error)
    }
    // finally {
    //     await db.close();
    // }
}
controller.deleteRole = async (req, res, next) => {
    let { lang } = req.query
    let { roleId } = req.body
    let t = await db.transaction({
        autoCommit: false,
        autoCommitTransactionalOFF: true,
    });

    try {
        let findRole = await model.mst_role.findOne({
            where: {
                id_role: { [Op.in]: roleId }
            }, transaction: t
        })
        console.log(findRole, '-----');
        if (!findRole) {
            responseStatus.resNotFound(res, "Data not found")
        } else {
            let findUserRole = await model.mst_profile.findAll({
                where: {
                    id_role: { [Op.in]: roleId }
                }
            })
            console.log(findUserRole, "find all")
            if (findUserRole.length > 0) {
                for (let i = 0; i < findUserRole.length; i++) {
                    // console.log(findUserRole[i].dataValues.ID_USER, '--====');
                    var updateUser = await model.mst_profile.update({
                        id_role: null,
                        updated_by: req.USERNAME,
                        updated_at: new Date()
                    }, { where: { id_profile: findUserRole[i].id_profile }, transaction: t })
                    console.log(updateUser, "find all3")
                }
                //var updateUser
            }

            console.log("find all 1")
            let deleteRole = await model.mst_role.destroy({ where: { id_role: { [Op.in]: roleId } }, transaction: t })

            console.log(deleteRole, "find all 2")
            await t.commit()
            res.status(201).json({
                code: "1",
                msg: lang == "en" ? "Success Delete Data" : "Berhasil Menghapus Data",
                data: {
                    updateUser,
                    deleteRole
                }
            });
        }
    } catch (error) {
        console.log(error)
        if (t && !t.finished) await t.rollback();
        next(error)
    }
}

// list user
controller.getAllUser = async (req, res, next) => {
    let { page, size, searchWord } = req.query
    try {
        console.log("req query", req.query)
        let getPagination = (page, size) => {
            const limit = size ? +size : 0;
            const offset = page ? 0 + (page - 1) * limit : 0;
            return { limit, offset };
        };

        let limit = getPagination(page, size).limit;
        let offset = getPagination(page, size).offset;

        let search = {
            // limit,
            // offset,
            where: {
                // [Op.or]: [
                // ]
            },
            logging: console.log
        }

        search.include = {
            model: model.mst_role,
            include: {
                model: model.mst_role_management
            }
        }

        if (limit != 0 || offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("employee_name")), {
                    [Op.like]: `%${searchWord}%`,
                }),
                db.where(db.fn("lower", db.col("username")), {
                    [Op.like]: `%${searchWord}%`,
                }),
            )
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("username")), {
                    [Op.like]: `%${searchWord}%`,
                }),
            )
        }

        let user = await model.mst_profile.findAndCountAll(search);

        let searchCount = search
        delete searchCount.include
        let count = await model.mst_profile.count(searchCount)

        if (!user || user.length < 1) {
            throw new ErrorResponse("Data not found!", 404)
        }

        let listUser = []

        for (let i = 0; i < user.rows.length; i++) {
            let getRole = await model.mst_role_management.findAll({
                include: [
                    {
                        model: model.mst_role_event,
                        required: true,
                        include: [
                            {
                                model: model.mst_role_event_parent,
                                required: true
                            }
                        ]
                    },
                    {
                        model: model.mst_role,
                        required: true
                    }
                ],
                where: { id_role: user.rows[i]?.id_role }
            })

            let getDetailLocationWork = await model.detail_location_work.findAll({
                include: [
                    {
                        model: model.mst_location,
                        attributes: [["location_name", "location_name"]],
                        required: true
                    }
                ],
                where: { id_profile: user.rows[i]?.id_profile }
            })

            let defaultLocation = []
            let additionalLocation = []
            for (let j = 0; j < getDetailLocationWork.length; j++) {
                console.log("getDetailLocationWork[j].is_default", getDetailLocationWork[j].is_default)
                if (getDetailLocationWork[j].is_default === "Y") {
                    defaultLocation.push(getDetailLocationWork[j].mst_location?.location_name)
                }
                if (getDetailLocationWork[j].is_default === "N") {
                    additionalLocation.push(getDetailLocationWork[j].mst_location?.location_name)
                }
            }

            let roleEvent = []
            let roleAccess = {}

            for (let j = 0; j < getRole.length; j++) {
                roleEvent.push(getRole[j].mst_role_event.event+" "+getRole[j].mst_role_event.mst_role_event_parent.parent_name)
                roleAccess = getRole[j].mst_role
            }

            listUser.push({
                id_profile: user.rows[i]?.id_profile,
                position: user.rows[i]?.position,
                employee_name: user.rows[i]?.employee_name,
                phone_number: user.rows[i]?.phone_number,
                email: user.rows[i]?.email,
                leader_code: user.rows[i]?.leader_code,
                id_role: user.rows[i]?.id_role,
                username: user.rows[i]?.username,
                password: user.rows[i]?.password,
                created_at: user.rows[i]?.created_at,
                created_by: user.rows[i]?.created_by,
                updated_at: user.rows[i]?.updated_at,
                updated_by: user.rows[i]?.updated_by,
                id_location: user.rows[i]?.id_location,
                role_event: roleEvent,
                role_access: roleAccess,
                detail_location_work: {
                    default: defaultLocation,
                    additional: additionalLocation
                }
            })
        }

        let response = {
            count: count,
            rows: listUser
        }

        return responseStatus.resOK(res, response)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.getOneUser = async (req, res, next) => {
    let { id } = req.query
    try {
        if (!id) {
            throw new ErrorResponse("Please insert id!", 400)
        }

        let user = await model.mst_profile.findOne(
            {
                include: [
                    { model: model.mst_role },
                    { model: model.mst_location }
                ],
                where: { id_profile: id }
            },
        );

        if (!user) {
            throw new ErrorResponse("Data not found!", 404)
        }

        return responseStatus.resOK(res, user)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

// delete user
controller.deleteUser = async (req, res, next) => {
    let { id } = req.body
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    try {
        if (!id || id.length < 1) {
            throw new ErrorResponse("Please insert id!", 400)
        }

        let deleteUser = await model.mst_profile.destroy({
            where: { id_profile: id },
            transaction: t
        })

        await t.commit()

        return responseStatus.resOK(res, "Success delete user!")
    } catch (error) {
        console.log(error)
        next(error)
    }
}

// auth
controller.login = async (req, res, next) => {
    let { username, password, system } = req.body
    try {
        if (!username) {
            throw new ErrorResponse("Please insert username!", 400)
        }

        if (!password) {
            throw new ErrorResponse("Please insert password!", 400)
        }

        if (!system) {
            throw new ErrorResponse("Please insert system!", 400)
        }

        let checkUser = await model.mst_profile.findOne({
            include: [{ model: model.mst_location }],
            where: { username: username }
        })

        if (!checkUser) throw new ErrorResponse("User not found", 404)

        let validate = decrypt(password, checkUser.password)
        console.log("validate", validate)

        let checkRole = await model.mst_role.findOne({
            where: { id_role: checkUser.id_role },
            include: {
                model: model.mst_role_level,
            }
        })

        let systemRole = checkRole.system.toLowerCase()

        if (systemRole !== "general" && systemRole !== system.toLowerCase()) {
            throw new ErrorResponse("This role is not allowed to access in this system!", 400)
        }

        let token

        if (checkUser && validate) {
            console.log("user valid")

            let roleAccess = {}

            let getRoleAccess = await db.query(`select 
            mrep.parent_name, mrep."system", mre."event", mrm.id_role  
            from mst_role_event_parent mrep
            join mst_role_event mre on mrep.id_role_event_parent = mre.id_role_event_parent 
            join mst_role_management mrm on mrm.id_role_event = mre.id_role_event 
            where mrm.id_role = ${checkUser.id_role}`, Sequelize.QueryTypes.SELECT)

            if (getRoleAccess.length > 0) {
                roleAccess = groupBy(getRoleAccess[0], 'parent_name')
            }

            var dataToken = {
                id_profile: checkUser.id_profile,
                name: checkUser.employee_name,
                email: checkUser.email,
                username: checkUser.username,
                position: checkUser.position,
                phone_number: checkUser.phone_number,
                id_role: checkUser.id_role,
                role_name: checkRole.role_name,
                company: checkUser.company,
                role_access: roleAccess,
                id_location: checkUser.id_location,
                location: checkUser.mst_location,
                role_level: checkRole.mst_role_level.level_name
            }

            var tokenJwt = {
                id_profile: checkUser.id_profile,
                name: checkUser.employee_name,
                email: checkUser.email,
                username: checkUser.username,
                position: checkUser.position,
                phone_number: checkUser.phone_number,
                id_role: checkUser.id_role,
                role_name: checkRole.role_name,
                company: checkUser.company,
                role_level: checkRole.mst_role_level.level_name
            }

            token = jwt.sign(tokenJwt, process.env.JWSECRET)

            dataToken.token = token

            console.log("token", token)

            return responseStatus.resOK(res, dataToken)
        } else {
            throw new ErrorResponse("Username or password invalid", 400)
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}

function generateRandomPassword(length) {
    return generatePassword(length, false);
}

controller.register = async (req, res, next) => {
    let { employee_name, phone_number, email, id_role, username, id_location, id_position, company, password } = req.body

    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });

    try {
        if (!username && !email) {
            throw new ErrorResponse("Please insert email or username!", 400)
        }

        // if (!password) {
        //     throw new ErrorResponse("Please insert password!", 400)
        // }

        if (!id_role) {
            throw new ErrorResponse("Please insert id role!", 400)
        }

        let checkWhere = []

        if (email) {
            let regexCheckEmail = /\S+@\S+\.\S+/;
            let checkEmail = regexCheckEmail.test(email);
            if (!checkEmail) {
                throw new ErrorResponse("Please enter a valid email!", 400)
            }

            checkWhere.push({ email: email })
        }

        if (username) {
            checkWhere.push({ username: username })
        }

        //let password = generateRandomPassword(10)

        let checkDuplicate = await model.mst_profile.findOne({
            where: {
                [Op.or]: checkWhere
            }
        })

        if (checkDuplicate) {
            throw new ErrorResponse("Username or email already used!", 400)
        }

        let password_hash = encrypt(password)

        const functionCall = "SELECT insert_mst_profile_new(:employee_name, :phone_number, :email, :id_role, :username, :password, :created_at, :created_by, :updated_at, :updated_by, :id_location, :id_position, :company)";

        const parameter = {
            employee_name: employee_name ?? null,
            phone_number: phone_number ?? null,
            email: email ?? null,
            id_role: id_role ?? null,
            username: username ?? null,
            password: password_hash ?? null,
            created_at: new Date(),
            created_by: req.username,
            updated_at: new Date(),
            updated_by: req.username,
            id_location: id_location ?? null,
            id_position: id_position ?? null,
            company: company ?? null
        }

        db.query(functionCall, {
            replacements: parameter,
            type: Sequelize.QueryTypes.SELECT,
        })
        .then((results) => {
            console.log('Function executed successfully:', results);
            return responseStatus.resCreated(res, {
                id_profile: results[0].insert_mst_profile_new
            });
        })
        .catch((error) => {
            console.error('Error executing function:', error);
            throw new ErrorResponse(error, 400)
        })

        // await t.commit();
        console.log('Transaction committed successfully');

        let bodyEmail = "Account successfully registered. Your password is " + password

        var transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            secure: true,
            port: 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Register - ERP CMC",
            text: bodyEmail
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("Error: " + error);
                throw new ErrorResponse("Email failed to send: " + error, 400)
            } else {
                console.log("Email sent: " + info.response);
                return responseStatus.resOK(res, "Account successfully registered. Your password is sent to your email.")
            }
        });

        // .then((results) => {
        //     console.log('Procedure executed successfully:', results);
        //     return responseStatus.resCreated(res, parameter)
        // })
        // .catch((error) => {
        //     console.error('Error executing procedure:', error);
        //     return ErrorResponse(error, 400)
        // });

        //responseStatus.resOK(res, "Success Add User")
    } catch (error) {
        // if (t) {
        //     await t.rollback();
        //     console.log('Transaction rolled back');
        // }
        console.log(error);
        next(error)
    }
}
controller.editProfile = async (req, res, next) => {
    let { id_profile, employee_name, phone_number, email, leader_code, id_role, username, password, id_location, id_position, company } = req.body
    try {
        const functionCall = "SELECT update_mst_profile(:id_profile, :employee_name, :phone_number, :email, :id_role, :username, :password, :id_location, :id_position, :company, :updated_at, :updated_by)";

        let password_hash
        if (password) {
            password_hash = encrypt(password)
        }

        const parameter = {
            id_profile: id_profile,
            employee_name: employee_name ?? null,
            phone_number: phone_number ?? null,
            email: email ?? null,
            id_role: id_role ?? null,
            username: username ?? null,
            password: password ? password_hash : null,
            id_location: id_location ?? null,
            id_position: id_position ?? null,
            company: company ?? null,
            updated_at: new Date(),
            updated_by: req.username,
        }

        db.query(functionCall, {
            replacements: parameter,
            type: Sequelize.QueryTypes.SELECT, // Use SELECT for function calls
        })
            .then((results) => {
                console.log('Function executed successfully:', results);
                return responseStatus.resCreated(res, results[0].update_mst_profile);
            })
            .catch((error) => {
                console.error('Error executing function:', error);
                throw new ErrorResponse(error, 400)
            });
    } catch (error) {
        console.log(error)
        next(error)
    }
}

// forget password
controller.forgetPassword = async (req, res, next) => {
    let { email } = req.body
    try {
        let findUser = await model.mst_profile.findOne({ where: { email: email } })

        if (!findUser) {
            throw new ErrorResponse("Email is not registered!", 400)
        }

        console.log("find user", findUser)

        let dataToken = {
            id_profile: findUser.id_profile,
            username: findUser.username,
            email: findUser.email
        };

        let token = jwt.sign(dataToken, process.env.JWSECRET, {
            expiresIn: "10m",
        });

        var transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            secure: true,
            port: 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Reset Password - ERP CMC",
            text: token
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("Error: " + error);
                throw new ErrorResponse("Email failed to send: " + error, 400)
            } else {
                console.log("Email sent: " + info.response);
                return responseStatus.resOK(res, "Email sent!")
            }
        });
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.confirmPassword = async (req, res, next) => {
    const { token, password, confirmPassword } = req.body
    try {
        let verify = jwt.verify(token, process.env.JWSECRET)
        let id_profile = verify.id_profile
        let username = verify.username

        if (!username) {
            throw new ErrorResponse("Token has expired")
        }

        if (password !== confirmPassword) {
            throw new ErrorResponse("Password entered not match!")
        }

        let newPassword = encrypt(password)

        const functionCall = "SELECT update_mst_profile(:id_profile, :position, :employee_name, :phone_number, :email, :leader_code, :id_role, :username, :password, :id_location, :updated_at, :updated_by)";

        const parameter = {
            id_profile: id_profile,
            position: null,
            employee_name: null,
            phone_number: null,
            email: null,
            leader_code: null,
            id_role: null,
            username: null,
            password: newPassword,
            id_location: null,
            updated_at: new Date(),
            updated_by: username,
        }

        db.query(functionCall, {
            replacements: parameter,
            type: Sequelize.QueryTypes.SELECT, // Use SELECT for function calls
        })
            .then((results) => {
                console.log('Function executed successfully:', results);
                return responseStatus.resOK(res, "Success reset password!");
            })
            .catch((error) => {
                console.error('Error executing function:', error);
                throw new ErrorResponse(error, 400)
            });
    } catch (error) {
        console.log(error)
        next(error)
    }
}



// Mobile


// Role level (Done)
controller.getRoleLevelMobile = async (req, res, next) => {
    let { page, size, lang, searchWord } = req.query
    // list level
    //await db.open();
    try {
        let number = (page - 1) * size;
        let getPagination = (page, size) => {
            const limit = size ? +size : 0;
            const offset = page ? 0 + (page - 1) * limit : 0;
            return { limit, offset };
        };
        let limit = getPagination(page, size).limit;
        let offset = getPagination(page, size).offset;

        let search = {
            // limit,
            // offset,
            where: {
                // [Op.or]: [
                // ]
            },
            logging: console.log
        }

        if (limit != 0 && offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("level_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                // { ROLE_NAME: { $like: `${searchWord}%`} }
            )
        }

        let dataLevel = await model.mst_role_level.findAndCountAll(search)
        console.log(dataLevel)
        if (dataLevel.rows.length > 0) {
            responseStatus.resOK(res, dataLevel);
        } else {
            responseStatus.resNotFound(res, "Data role level Empty");
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
    // finally{
    //     await db.close();
    // }   
}

controller.getRoleLevelOneMobile = async (req, res, next) => {
    let { id_level } = req.query
    try {
        let dataLevel = await model.mst_role_level.findOne({
            where: {
                id_role_level: id_level
            },
        })
        if (dataLevel) {
            responseStatus.resOK(res, dataLevel);
        } else {
            responseStatus.resNotFound(res, "Data role level Not Found");
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
    // finally {
    //     await db.close();
    // }
}

controller.addLevelMobile = async (req, res, next) => {
    let { id_level } = req.query
    let { level_name } = req.body
    console.log("masuk sini")
    try {
        const levelProcedure = "CALL insert_mst_role_level(:level_name)";
        const parameter = {
            level_name: level_name
        }
        db.query(levelProcedure, {
            replacements: parameter,
            type: Sequelize.QueryTypes.RAW, // Use RAW query type for stored procedures
        })
            .then((results) => {
                console.log('Procedure executed successfully:', results);
                return responseStatus.resCreated(res, parameter)
            })
            .catch((error) => {
                console.log(error, "-")
                if (error.name === "SequelizeDatabaseError") {
                    return responseStatus.resNotAcceptable(res, "Level Name is Already Exist");
                } else {
                    return responseStatus.resInternalServerError(res, error);
                }
            });
    } catch (error) {
        console.log(error);
        next(error)
    }
}

controller.editLevelMobile = async (req, res, next) => {
    let { id_level } = req.query
    let { level_name } = req.body
    try {
        const result = await db.query(
            'SELECT update_mst_role_level(:p_id_role_level, :level_name) as result_text',
            {
                replacements: {
                    p_id_role_level: id_level,
                    level_name: level_name
                },
                type: Sequelize.QueryTypes.SELECT,
            }
        )
            .then((results) => {
                console.log(results)
                if (results[0].result_text === 'Data updated successfully') {
                    return responseStatus.resCreated(res, results);
                } else if (results[0].result_text === 'Level Name is Already Exist') {
                    return responseStatus.resNotAcceptable(res, results);
                } else {
                    return responseStatus.resNotFound(res, results);
                }

            })
            .catch((error) => {
                next(error)
            });
    } catch (error) {
        console.log(error, "masuk sini");
        next(error)
    }
    // finally{
    //     await db.close();
    // }
}

// role event parent (Done)
controller.getRoleParentMobile = async (req, res, next) => {
    let { page, size, lang, searchWord, system } = req.query

    // list level parent
    try {
        // let number = (page - 1) * size;
        // let getPagination = (page, size) => {
        // const limit = size ? +size : 0;
        // const offset = page ? 0 + (page - 1) * limit : 0;
        // return { limit, offset };
        // };
        // let limit = getPagination(page, size).limit;
        // let offset = getPagination(page, size).offset;

        let dataSystem = []
        if (system == "Web") {
            dataSystem = ["Web", "General"]
        } else if (system == "Mobile") {
            dataSystem = ["Mobile", "General"]
        } else {
            dataSystem = ["Web", "Mobile", "General"]
        }

        let search = {
            // limit,
            // offset,
            where: {
                [Op.and]: [
                    { system: dataSystem },
                    //{ [Op.or]: [] }
                ]
            },
            include: [
                {
                    model: model.mst_role_event,
                    attributes: [["event", "event"], ["id_role_event", "id_role_event"]]
                }
            ],
            logging: console.log
        }


        if (searchWord) {
            search.where[Op.and].push({ [Op.or]: [] })
            search.where[Op.and][1][Op.or].push(
                db.where(db.fn("lower", db.col("parent_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("system")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                })
                // { ROLE_NAME: { $like: `${searchWord}%`} }
            )
        }

        let dataParent = await model.mst_role_event_parent.findAll(search)
        console.log(JSON.stringify(dataParent))
        if (dataParent.length > 0) {
            dataParent.map((val) => {
                val.dataValues.type = 'Parent'
                if (val.dataValues.mst_role_event.length > 0) {
                    val.dataValues.mst_role_event.map((index) => {
                        index.dataValues.type = 'Child'
                    })
                }
            })
            responseStatus.resOK(res, dataParent);
        } else {
            responseStatus.resNotFound(res, "Data role Parent Empty");
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
    // finally{
    //     await db.close();
    // }   
}

controller.getRoleParentOneMobile = async (req, res, next) => {
    let { id_parent } = req.query
    try {
        let dataParent = await model.mst_role_event_parent.findOne({
            where: {
                id_role_event_parent: id_parent
            },
        })
        if (dataParent) {
            responseStatus.resOK(res, dataParent);
        } else {
            responseStatus.resNotFound(res, "Data role level Not Found");
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
    // finally {
    //     await db.close();
    // }
}

controller.addRoleParentMobile = async (req, res, next) => {
    let { parent_name, system } = req.body
    try {
        let parameter = {
            parent_name: parent_name,
            system: system
        }
        await db.query(
            'CALL insert_mst_role_event_parent(:parent_name, :system)',
            {
                replacements: parameter,
                type: Sequelize.QueryTypes.RAW,
            }
        )
            .then((results) => {
                console.log('Procedure executed successfully:', results);
                return responseStatus.resCreated(res, parameter)
            })
            .catch((error) => {
                if (error.name === "SequelizeDatabaseError") {
                    return responseStatus.resNotAcceptable(res, "Parent Name is Already Exist");
                } else {
                    return responseStatus.resInternalServerError(res, error);
                }
            });
    } catch (error) {
        console.log(error, "masuk sini");
        next(error)
    }
    // finally{
    //     await db.close();
    // }
}

controller.editRoleParentMobile = async (req, res, next) => {
    let { id_parent } = req.query
    let { parent_name, system } = req.body
    try {
        const result = await db.query(
            'SELECT update_mst_role_event_parent(:p_id_role_event_parent, :p_parent_name, :p_system) as result_text',
            {
                replacements: {
                    p_id_role_event_parent: id_parent,
                    p_parent_name: parent_name,
                    p_system: system
                },
                type: Sequelize.QueryTypes.SELECT,
            }
        )
            .then((results) => {
                console.log(results)
                if (results[0].result_text === 'Data updated successfully') {
                    return responseStatus.resCreated(res, results);
                } else if (results[0].result_text === 'Parent Event is Already Exist') {
                    return responseStatus.resNotAcceptable(res, results);
                } else {
                    return responseStatus.resNotFound(res, results);
                }
            })
            .catch((error) => {
                next(error)
            });
    } catch (error) {
        console.log(error, "masuk sini");
        next(error)
    }
    // finally{
    //     await db.close();
    // }
}

// role event (Done)
controller.getRoleEventMobile = async (req, res, next) => {
    let { page, size, lang, searchWord } = req.query
    try {
        let number = (page - 1) * size;
        let getPagination = (page, size) => {
            const limit = size ? +size : 0;
            const offset = page ? 0 + (page - 1) * limit : 0;
            return { limit, offset };
        };
        let limit = getPagination(page, size).limit;
        let offset = getPagination(page, size).offset;

        let search = {
            // limit,
            // offset,
            where: {
                // [Op.or]: [
                // ]
            },
            logging: console.log
        }

        if (limit != 0 && offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("event")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                // { ROLE_NAME: { $like: `${searchWord}%`} }
            )
        }
        let dataEvent = await model.mst_role_event.findAndCountAll(search)
        if (dataEvent.rows.length > 0) {
            responseStatus.resOK(res, dataEvent);
        } else {
            responseStatus.resNotFound(res, "Data role event Empty");
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
    // finally {
    //     await db.close();
    // }
}
controller.getRoleEventOneMobile = async (req, res, next) => {
    let { id_role_event } = req.query
    try {
        let dataEvent = await model.mst_role_event.findOne({
            include: [
                { model: model.mst_role_event_parent }
            ],
            where: {
                id_role_event: id_role_event
            }
        })
        if (dataEvent) {
            responseStatus.resOK(res, dataEvent);
        } else {
            responseStatus.resNotFound(res, "Data role Event Not Found");
        }
    } catch (error) {
        next(error)
    }
    // finally {
    //     await db.close()
    // }
}
controller.addRoleEventMobile = async (req, res, next) => {
    let { id_parent, event } = req.body
    try {
        let parameter = {
            p_event: event,
            p_id_event_parent: id_parent
        }
        await db.query(
            'CALL insert_mst_role_event(:p_event, :p_id_event_parent)',
            {
                replacements: parameter,
                type: Sequelize.QueryTypes.RAW,
            }
        )
            .then((results) => {
                console.log('Procedure executed successfully:', results);
                return responseStatus.resCreated(res, parameter)
            })
            .catch((error) => {
                if (error.name === "SequelizeDatabaseError") {
                    return responseStatus.resNotAcceptable(res, "Event is Already Exist");
                } else {
                    return responseStatus.resInternalServerError(res, error);
                }
            });
    } catch (error) {
        console.log(error)
        next(error)
    }
    // finally {
    //     await db.close;
    // }
}
controller.editRoleEventMobile = async (req, res, next) => {
    let { id_event } = req.query
    let { event, id_parent } = req.body
    try {
        const result = await db.query(
            'SELECT update_mst_role_event(:p_id_role_event, :p_event, :p_id_parent) as result_text',
            {
                replacements: {
                    p_id_role_event: id_event,
                    p_event: event,
                    p_id_parent: id_parent
                },
                type: Sequelize.QueryTypes.SELECT,
            }
        )
            .then((results) => {
                console.log(results)
                if (results[0].result_text === 'Data updated successfully') {
                    return responseStatus.resCreated(res, results);
                } else if (results[0].result_text === 'Event is Already Exist') {
                    return responseStatus.resNotAcceptable(res, results);
                } else {
                    return responseStatus.resNotFound(res, results);
                }
            })
            .catch((error) => {
                next(error)
            });
    } catch (error) {
        console.log(error, "masuk sini");
        next(error)
    }
    // finally{
    //     await db.close();
    // }
}

// role management

controller.listRoleMobile = async (req, res, next) => {
    let {
        distinct, page, size, searchWord, lang
    } = req.query;

    let number = (page - 1) * size;
    let getPagination = (page, size) => {
        const limit = size ? +size : 0;
        const offset = page ? 0 + (page - 1) * limit : 0;
        return { limit, offset };
    };
    let limit = getPagination(page, size).limit;
    let offset = getPagination(page, size).offset;

    try {
        let search = {
            // limit,
            // offset,
            where: {
                // [Op.or]: [
                // ]
            },
            logging: console.log
        }

        if (limit != 0 && offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("role_name")), {
                    [Op.like]: `%${searchWord}%`,
                }),
            )
        }

        let checkRole = await model.mst_role.findAndCountAll(search)

        let data = await model.mst_role_level.findAll()
        console.log("data.....")
        const findLevel = (id) => data.find((val) =>
            val.dataValues.id_role_level == id
        );

        for (let i = 0; i < checkRole.rows.length; i++) {
            let level = findLevel(checkRole.rows[i].dataValues.id_role_event)

            checkRole.rows[i].dataValues.mst_role_level = level
        }

        // console.log(checkRole)
        if (checkRole.rows.length > 0) {
            res.status(200).json({
                code: "1",
                msg: lang == "en" ? "Success Read Data" : "Berhasil Membaca Data",
                checkRole,
            });
        } else {
            throw new ErrorResponse("Data Role is null", 404);
        }
    } catch (error) {
        next(error)
    }
    // finally{
    //     await db.close();
    // }
}
controller.listRoleOneMobile = async (req, res, next) => {
    let { id_role, lang } = req.query

    try {
        var result = {}
        let findDataRole = await model.mst_role.findOne({
            where: {
                id_role: id_role
            },
        })
        let dataRole = findDataRole.dataValues
        let findRoleLevel = await model.mst_role_level.findOne({
            where: {
                id_role_level: dataRole.id_role_level
            },
            attributes: [["level_name", "level_name"]]
        })
        result.id_role = dataRole.id_role
        result.role_name = dataRole.role_name
        result.id_role_level = dataRole.id_role_level
        result.level_name = findRoleLevel.dataValues.level_name
        result.system = dataRole.system

        if (findDataRole) {

            let roleManagement = await model.mst_role_management.findAll({
                where: {
                    id_role: dataRole.id_role
                },
                include: [
                    { model: model.mst_role_event }
                ]
            })

            var id_role_event_parent = []
            var module = []
            var list = []

            const findReference = (id) => module.findIndex((ref, i) => ref.id_role_event_parent == id);

            for (let i = 0; i < roleManagement.length; i++) {
                let management = roleManagement[i].dataValues
                let event = management.mst_role_event.dataValues
                let parent = event.id_role_event_parent

                let find = findReference(parent)
                console.log(find, "nialai find.......")
                list.push({ value: management.id_role_event, label: event.event, roleManagementId: management.id_role_management })
                console.log(module, "nilai mmmmmmmmmmmmmmmmmmm")

                if (find >= 0) {

                    module[find].module.push({ value: management.id_role_event, label: event.event, roleManagementId: management.id_role_management })
                } else {
                    id_role_event_parent.push(parent)
                    let idParent = await model.mst_role_event_parent.findOne({
                        where: {
                            id_role_event_parent: parent
                        }, attributes: [["parent_name", "parent_name"]]
                    })
                    module.push({ id_role_event_parent: parent, parent_name: idParent.dataValues.parent_name, module: [{ value: management.id_role_event, label: event.event, roleManagementId: management.id_role_management }] })

                }
            }
            result.modules = module
            result.list = list

            res.status(200).json({
                code: "1",
                msg: "Success Read Data",
                result,
            });
        } else {
            throw new ErrorResponse("Data Role not found", 404);
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
    // finally {
    //     await db.close();
    // }
}
controller.updateRoleMobile = async (req, res, next) => {
    let { roleId, lang } = req.query
    let { idLevel, roleName, module, system } = req.body


    const transUpdate = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    try {
        let detailRole = await model.mst_role.findOne({
            include: [
                {
                    model: model.mst_role_management
                },
            ],
            where: { id_role: roleId }
        })
        if (idLevel || roleName) {
            let updateRole = await model.mst_role.update({ id_role_level: idLevel, role_name: roleName, system: system }, { where: { id_role: roleId } })
            if (updateRole != 1) throw new ErrorResponse("Update Error", 400);
        }
        module = JSON.parse(module)

        const findReference = (ids) => module.find((ref) => ref.roleManagementId == ids);
        let idDelete = []

        let roleManag = detailRole.dataValues.mst_role_event_parent
        for (let i = 0; i < roleManag.length; i++) {
            // console.log(data, "nilai dayajsiajsiih")
            let data = findReference(roleManag[i].dataValues.id_role_management)
            if (!data) {
                idDelete.push(roleManag[i].dataValues.id_role_management)
            }
            // console.log(data, "nilai dayajsiajsiih")
        }
        if (idDelete.length > 0) {
            let deleteID = await model.mst_role_management.destroy({
                where: {
                    id_role_management: { [Op.or]: idDelete }
                }
            })
            if (deleteID != 1) throw new ErrorResponse("Update Error", 400);
        }
        for (let j = 0; j < module.length; j++) {
            let data = module[j]
            // console.log(data.idEvent, "cobaksoasj")
            if (!data.roleManagementId) {
                let insert = await model.mst_role_management.create({
                    id_role: roleId, id_role_event: data.idEvent
                })
                if (!insert) throw new ErrorResponse("Update Error", 400);
            }
        }
        res.status(201).json({
            code: "1",
            msg: lang == "en" ? "Success Update Data" : "Berhasil memperbarui data",
        });


    } catch (error) {
        console.log(error)
        if (transUpdate && !transUpdate.finished) await transUpdate.rollback();
        next(error)
    }
    // finally {
    //     await db.close();
    // }
}
controller.addRoleMobile = async (req, res, next) => {
    let { roleId, lang } = req.query
    let { idLevel, idPort, idTerminal, idCompany, roleName, module, system } = req.body



    // idLevel = 3
    // module = "[{\"idEvent\":1}]"
    // roleName = "Test1"
    // system = "Web" // ini bisa "Mobile" // kalo milih 2 "General"

    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    let search = {
        where: {
            [Op.and]: [
                { role_name: roleName },
                { id_role_level: idLevel },
                { system: system }
            ]
        }
    }

    try {
        let checkRole = await model.mst_role.findOne(search)
        console.log(checkRole, "module......")
        if (checkRole) throw new ErrorResponse("Data role is already Exist", 406);
        let createRole = await model.mst_role.create({
            role_name: roleName,
            id_role_level: idLevel,
            system: system

        }, { transaction: t })

        let findCreateModule = await model.mst_role.findOne({
            where: {
                [Op.and]: [
                    { role_name: roleName },
                    { id_role_level: idLevel }
                ]
            },
            transaction: t
        })
        if (module) {
            module = JSON.parse(module)
            console.log(module, "module......")
            /*
            '[{idEvent : "08"},{idEvent : "09"}]'
            */
            if (module.length > 0) {
                console.log(createRole, "=====================");
                console.log(findCreateModule, "findCreateModule=====================");
                let valueAdd = []
                for (let i = 0; i < module.length; i++) {
                    let findRoleModule = await model.mst_role_management.findOne({
                        where: {
                            [Op.and]: [
                                { id_role: findCreateModule.id_role },
                                { id_role_event: module[i].idEvent }
                            ]
                        }
                    })
                    console.log(findRoleModule, "module semua......")
                    if (findRoleModule) throw new ErrorResponse("Data role is already Exist", 406);

                    if (module[i].idEvent) {
                        let find = valueAdd.find((item) => item.id_role === findCreateModule.id_role && item.id_role_event === module[i].idEvent)

                        if (!find) {
                            valueAdd.push({
                                id_role: findCreateModule.id_role,
                                id_role_event: module[i].idEvent
                            })
                        } else {
                            throw new ErrorResponse("Value cannot be same", 406);
                        }
                    } else {
                        throw new ErrorResponse("Please complete data", 406);
                    }
                }
                if (valueAdd.length > 0) {
                    var dataAddRoleModule = await model.mst_role_management.bulkCreate(valueAdd, { transaction: t })
                }
            }
            await t.commit()
            res.status(201).json({
                code: "1",
                msg: lang == "en" ? "Success Create Data" : "Berhasil Membuat Data",
                dataAddRoleModule
            });
        }
    } catch (error) {
        console.log(error)
        if (t && !t.finished) await t.rollback();
        next(error)
    }
    // finally {
    //     await db.close();
    // }
}
controller.deleteRoleMobile = async (req, res, next) => {
    let { lang } = req.query
    let { roleId } = req.body
    let t = await db.transaction({
        autoCommit: false,
        autoCommitTransactionalOFF: true,
    });

    try {
        let findRole = await model.mst_role.findOne({
            where: {
                id_role: { [Op.in]: roleId }
            }, transaction: t
        })
        console.log(findRole, '-----');
        if (!findRole) {
            responseStatus.resNotFound(res, "Data not found")
        } else {
            let findUserRole = await model.mst_profile.findAll({
                where: {
                    id_role: { [Op.in]: roleId }
                }
            })
            console.log(findUserRole, "find all")
            if (findUserRole.length > 0) {
                for (let i = 0; i < findUserRole.length; i++) {
                    // console.log(findUserRole[i].dataValues.ID_USER, '--====');
                    var updateUser = await model.mst_profile.update({
                        id_role: null,
                        updated_by: req.USERNAME,
                        updated_at: new Date()
                    }, { where: { id_profile: findUserRole[i].id_profile }, transaction: t })
                    console.log(updateUser, "find all3")
                }
                //var updateUser
            }

            console.log("find all 1")
            let deleteRole = await model.mst_role.destroy({ where: { id_role: { [Op.in]: roleId } }, transaction: t })

            console.log(deleteRole, "find all 2")
            await t.commit()
            res.status(201).json({
                code: "1",
                msg: lang == "en" ? "Success Delete Data" : "Berhasil Menghapus Data",
                data: {
                    updateUser,
                    deleteRole
                }
            });
        }
    } catch (error) {
        console.log(error)
        if (t && !t.finished) await t.rollback();
        next(error)
    }
}

// list user
controller.getAllUserMobile = async (req, res, next) => {
    let { page, size, searchWord } = req.query
    try {
        console.log("req query", req.query)
        let getPagination = (page, size) => {
            const limit = size ? +size : 0;
            const offset = page ? 0 + (page - 1) * limit : 0;
            return { limit, offset };
        };

        let limit = getPagination(page, size).limit;
        let offset = getPagination(page, size).offset;

        let search = {
            // limit,
            // offset,
            where: {
                // [Op.or]: [
                // ]
            },
            logging: console.log
        }

        search.include = {
            model: model.mst_role,
            include: {
                model: model.mst_role_management
            }
        }

        if (limit != 0 && offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("employee_name")), {
                    [Op.like]: `%${searchWord}%`,
                }),
            )
        }

        let user = await model.mst_profile.findAll(search);

        if (!user || user.length < 1) {
            throw new ErrorResponse("Data not found!", 404)
        }

        let listUser = []

        for (let i = 0; i < user.length; i++) {
            let getRole = await model.mst_role_management.findAll({
                include: [
                    {
                        model: model.mst_role_event,
                        required: true
                    },
                    {
                        model: model.mst_role,
                        required: true
                    }
                ],
                where: { id_role: user[i].id_role }
            })

            let roleEvent = []
            let roleAccess = {}

            for (let j = 0; j < getRole.length; j++) {
                roleEvent.push(getRole[j].mst_role_event.event)
                roleAccess = getRole[j].mst_role
            }

            listUser.push({
                id_profile: user[i].id_profile,
                position: user[i].position,
                employee_name: user[i].employee_name,
                phone_number: user[i].phone_number,
                email: user[i].phone_number,
                leader_code: user[i].leader_code,
                id_role: user[i].id_role,
                username: user[i].username,
                password: user[i].password,
                created_at: user[i].created_at,
                created_by: user[i].created_by,
                updated_at: user[i].updated_at,
                updated_by: user[i].updated_by,
                id_location: user[i].id_location,
                role_event: roleEvent,
                role_access: roleAccess
            })
        }

        let response = {
            count: user.length,
            rows: listUser
        }

        return responseStatus.resOK(res, response)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.getOneUserMobile = async (req, res, next) => {
    let { id } = req.query
    try {
        if (!id) {
            throw new ErrorResponse("Please insert id!", 400)
        }

        let user = await model.mst_profile.findOne(
            {
                include: [
                    { model: model.mst_role },
                    { model: model.mst_location }
                ],
                where: { id_profile: id }
            },
        );

        if (!user) {
            throw new ErrorResponse("Data not found!", 404)
        }

        return responseStatus.resOK(res, user)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

// delete user
controller.deleteUserMobile = async (req, res, next) => {
    let { id } = req.body
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    try {
        if (!id || id.length < 1) {
            throw new ErrorResponse("Please insert id!", 400)
        }

        let deleteUser = await model.mst_profile.destroy({
            where: { id_profile: id },
            transaction: t
        })

        await t.commit()

        return responseStatus.resOK(res, "Success delete user!")
    } catch (error) {
        console.log(error)
        next(error)
    }
}

// auth
controller.loginMobile = async (req, res, next) => {
    let { username, password, system } = req.body
    try {
        if (!username) {
            throw new ErrorResponse("Please insert username!", 400)
        }

        if (!password) {
            throw new ErrorResponse("Please insert password!", 400)
        }

        if (!system) {
            throw new ErrorResponse("Please insert system!", 400)
        }

        let checkUser = await model.mst_profile.findOne({
            include: [{ model: model.mst_location }],
            where: { username: username }
        })

        if (!checkUser) throw new ErrorResponse("User not found", 404)

        let validate = decrypt(password, checkUser.password)
        console.log("validate", validate)

        let checkRole = await model.mst_role.findOne({
            where: { id_role: checkUser.id_role },
            include: {
                model: model.mst_role_level,
            }
        })

        let systemRole = checkRole.system.toLowerCase()

        if (systemRole !== "general" && systemRole !== system.toLowerCase()) {
            throw new ErrorResponse("This role is not allowed to access in this system!", 400)
        }

        let token

        if (checkUser && validate) {
            console.log("user valid")

            let roleAccess = {}

            let getRoleAccess = await db.query(`select 
            mrep.parent_name, mrep."system", mre."event", mrm.id_role  
            from mst_role_event_parent mrep
            join mst_role_event mre on mrep.id_role_event_parent = mre.id_role_event_parent 
            join mst_role_management mrm on mrm.id_role_event = mre.id_role_event 
            where mrm.id_role = ${checkUser.id_role}`, Sequelize.QueryTypes.SELECT)

            if (getRoleAccess.length > 0) {
                roleAccess = groupBy(getRoleAccess[0], 'parent_name')
            }

            var dataToken = {
                id_profile: checkUser.id_profile,
                name: checkUser.employee_name,
                email: checkUser.email,
                username: checkUser.username,
                position: checkUser.position,
                phone_number: checkUser.phone_number,
                id_role: checkUser.id_role,
                role_name: checkRole.role_name,
                company: checkUser.company,
                role_access: roleAccess,
                id_location: checkUser.id_location,
                location: checkUser.mst_location,
                role_level: checkRole.mst_role_level.level_name
            }

            var tokenJwt = {
                id_profile: checkUser.id_profile,
                name: checkUser.employee_name,
                email: checkUser.email,
                username: checkUser.username,
                position: checkUser.position,
                phone_number: checkUser.phone_number,
                id_role: checkUser.id_role,
                role_name: checkRole.role_name,
                company: checkUser.company,
                role_level: checkRole.mst_role_level.level_name
            }

            token = jwt.sign(tokenJwt, process.env.JWSECRET)

            dataToken.token = token

            console.log("token", token)

            return responseStatus.resOK(res, dataToken)
        } else {
            throw new ErrorResponse("Username or password invalid", 400)
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}

// function generateRandomPassword(length) {
//     return generatePassword(length, false);
// }

controller.registerMobile = async (req, res, next) => {
    let { employee_name, phone_number, email, id_role, username, id_location, id_position, company, password } = req.body

    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });

    try {
        if (!username && !email) {
            throw new ErrorResponse("Please insert email or username!", 400)
        }

        // if (!password) {
        //     throw new ErrorResponse("Please insert password!", 400)
        // }

        if (!id_role) {
            throw new ErrorResponse("Please insert id role!", 400)
        }

        let checkWhere = []

        if (email) {
            let regexCheckEmail = /\S+@\S+\.\S+/;
            let checkEmail = regexCheckEmail.test(email);
            if (!checkEmail) {
                throw new ErrorResponse("Please enter a valid email!", 400)
            }

            checkWhere.push({ email: email })
        }

        if (username) {
            checkWhere.push({ username: username })
        }

        //let password = generateRandomPassword(10)

        let checkDuplicate = await model.mst_profile.findOne({
            where: {
                [Op.or]: checkWhere
            }
        })

        if (checkDuplicate) {
            throw new ErrorResponse("Username or email already used!", 400)
        }

        let password_hash = encrypt(password)

        const functionCall = "SELECT insert_mst_profile_new(:employee_name, :phone_number, :email, :id_role, :username, :password, :created_at, :created_by, :updated_at, :updated_by, :id_location, :id_position, :company)";

        const parameter = {
            employee_name: employee_name ?? null,
            phone_number: phone_number ?? null,
            email: email ?? null,
            id_role: id_role ?? null,
            username: username ?? null,
            password: password_hash ?? null,
            created_at: new Date(),
            created_by: req.username,
            updated_at: new Date(),
            updated_by: req.username,
            id_location: id_location ?? null,
            id_position: id_position ?? null,
            company: company ?? null
        }

        db.query(functionCall, {
            replacements: parameter,
            type: Sequelize.QueryTypes.SELECT, // Use RAW query type for stored procedures
        })
        .then((results) => {
            console.log('Function executed successfully:', results);
            return responseStatus.resCreated(res, {
                id_profile: results[0].insert_mst_profile_new
            });
        })
        .catch((error) => {
            console.error('Error executing function:', error);
            throw new ErrorResponse(error, 400)
        })

        // await t.commit();
        console.log('Transaction committed successfully');

        let bodyEmail = "Account successfully registered. Your password is " + password

        var transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            secure: true,
            port: 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Register - ERP CMC",
            text: bodyEmail
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("Error: " + error);
                throw new ErrorResponse("Email failed to send: " + error, 400)
            } else {
                console.log("Email sent: " + info.response);
                return responseStatus.resOK(res, "Account successfully registered. Your password is sent to your email.")
            }
        });

        // .then((results) => {
        //     console.log('Procedure executed successfully:', results);
        //     return responseStatus.resCreated(res, parameter)
        // })
        // .catch((error) => {
        //     console.error('Error executing procedure:', error);
        //     return ErrorResponse(error, 400)
        // });

        //responseStatus.resOK(res, "Success Add User")
    } catch (error) {
        // if (t) {
        //     await t.rollback();
        //     console.log('Transaction rolled back');
        // }
        console.log(error);
        next(error)
    }
}
controller.editProfileMobile = async (req, res, next) => {
    let { id_profile, position, employee_name, phone_number, email, leader_code, id_role, username, password, id_location, company } = req.body
    try {
        const functionCall = "SELECT update_mst_profile(:id_profile, :position, :employee_name, :phone_number, :email, :leader_code, :id_role, :username, :password, :id_location, :company, :updated_at, :updated_by)";

        const parameter = {
            id_profile: id_profile,
            position: position ?? null,
            employee_name: employee_name ?? null,
            phone_number: phone_number ?? null,
            email: email ?? null,
            leader_code: leader_code ?? null,
            id_role: id_role ?? null,
            username: username ?? null,
            password: null,
            id_location: id_location ?? null,
            company: company ?? null,
            updated_at: new Date(),
            updated_by: req.username,
        }

        db.query(functionCall, {
            replacements: parameter,
            type: Sequelize.QueryTypes.SELECT, // Use SELECT for function calls
        })
            .then((results) => {
                console.log('Function executed successfully:', results);
                return responseStatus.resCreated(res, results[0].update_mst_profile);
            })
            .catch((error) => {
                console.error('Error executing function:', error);
                throw new ErrorResponse(error, 400)
            });
    } catch (error) {
        console.log(error)
        next(error)
    }
}

// forget password
controller.forgetPasswordMobile = async (req, res, next) => {
    let { email } = req.body
    try {
        let findUser = await model.mst_profile.findOne({ where: { email: email } })

        if (!findUser) {
            throw new ErrorResponse("Email is not registered!", 400)
        }

        console.log("find user", findUser)

        let dataToken = {
            id_profile: findUser.id_profile,
            username: findUser.username,
            email: findUser.email
        };

        let token = jwt.sign(dataToken, process.env.JWSECRET, {
            expiresIn: "10m",
        });

        var transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            secure: true,
            port: 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Reset Password - ERP CMC",
            text: token
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("Error: " + error);
                throw new ErrorResponse("Email failed to send: " + error, 400)
            } else {
                console.log("Email sent: " + info.response);
                return responseStatus.resOK(res, "Email sent!")
            }
        });
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.confirmPasswordMobile = async (req, res, next) => {
    const { token, password, confirmPassword } = req.body
    try {
        let verify = jwt.verify(token, process.env.JWSECRET)
        let id_profile = verify.id_profile
        let username = verify.username

        if (!username) {
            throw new ErrorResponse("Token has expired")
        }

        if (password !== confirmPassword) {
            throw new ErrorResponse("Password entered not match!")
        }

        let newPassword = encrypt(password)

        const functionCall = "SELECT update_mst_profile(:id_profile, :position, :employee_name, :phone_number, :email, :leader_code, :id_role, :username, :password, :id_location, :updated_at, :updated_by)";

        const parameter = {
            id_profile: id_profile,
            position: null,
            employee_name: null,
            phone_number: null,
            email: null,
            leader_code: null,
            id_role: null,
            username: null,
            password: newPassword,
            id_location: null,
            updated_at: new Date(),
            updated_by: username,
        }

        db.query(functionCall, {
            replacements: parameter,
            type: Sequelize.QueryTypes.SELECT, // Use SELECT for function calls
        })
            .then((results) => {
                console.log('Function executed successfully:', results);
                return responseStatus.resOK(res, "Success reset password!");
            })
            .catch((error) => {
                console.error('Error executing function:', error);
                throw new ErrorResponse(error, 400)
            });
    } catch (error) {
        console.log(error)
        next(error)
    }
}

// location work
controller.updateDetailWork = async (req, res, next) => {
    let { dataUpdate, dataDelete, dataAdd } = req.body
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });

    /*
    {
        dataUpdate : [{id_detail_location_work: 1, id_profile : 1, id_location : 1, is_default: "Y"}],
        dataDelete : [1,2,3],
        dataCreate : [{id_profile : 1, id_location : 1, is_default: "Y"}]
    }
    */
    if (typeof (dataUpdate) == "string") {
        dataUpdate = JSON.parse(dataUpdate)
    }

    if (typeof (dataDelete) == "string") { 
        dataDelete = JSON.parse(dataDelete)
    }

    if (typeof (dataAdd) == "string") {
        dataAdd = JSON.parse(dataAdd)
    }

    try {
        let dataDefaultError = []

        var dataDeleteResponse
        if (dataDelete.length > 0) {
            dataDeleteResponse = await model.detail_location_work.destroy({
                where: { id_detail_location_work : dataDelete }
            }, 
            { transaction: t }
            )
        } else {
            dataDeleteResponse = "Doesn't have data to delete"
        }

        var dataAddResult 
        let dataAddFix = []
        if(dataAdd.length > 0){
            for(let i = 0; i < dataAdd.length; i++){
                let findDataDefault = await model.detail_location_work.findOne({
                    where: {
                        id_location: dataAdd[i].id_location,
                        is_default: 'Y'
                    }
                })
                let findDataDSame = await model.detail_location_work.findOne({
                    where: {
                        id_location: dataAdd[i].id_location,
                        id_profile: dataAdd[i].id_profile
                    }
                })

                if(findDataDefault){
                    let findDataLocation = await model.mst_location.findOne({
                        where : {
                            id_location : dataAdd[i].id_location
                        }
                    })
                    dataDefaultError.push(findDataLocation.location_name)
                } 
                // else {
                //     dataAddFix.push(dataAdd[i])
                // }

                if(!findDataDSame && !findDataDefault){
                    dataAddFix.push(dataAdd[i])
                }
            }

            if(dataAddFix.length > 0){
                dataAddResult = await model.detail_location_work.bulkCreate(dataAddFix, { transaction: t });
            }
        } else {
            dataAddResult = "Doesn't have data to add"
        }

        var dataUpdateResult 
        if(dataUpdate.length > 0){
            for(let i = 0; i < dataUpdate.length ; i++){
                let findDataDefault = await model.detail_location_work.findOne({
                    where: {
                        id_location: dataUpdate[i].id_location,
                        is_default: 'Y',
                        id_profile: { [Op.not]: dataUpdate[i].id_profile }
                    }
                })

                if(findDataDefault){
                    let findDataLocation = await model.mst_location.findOne({
                        where : {
                            id_location : dataUpdate[i].id_location
                        }
                    })
                    dataDefaultError.push(findDataLocation.location_name)
                } else {
                    dataUpdateResult = await model.detail_location_work.update({
                        is_default : dataUpdate[i].is_default
                    }, {
                        where : {
                            id_detail_location_work : dataUpdate[i].id_detail_location_work
                        }
                    }, 
                    { transaction: t })
                }
            }
        } else {
            dataUpdateResult = "Doesn't have data to update"
        }

        var defaultStatus = ""
        if(dataDefaultError.length){
            defaultStatus = `This city ${dataDefaultError.join(",")} already have another PIC`
        }

        await t.commit()

        responseStatus.resCreated(res, {
            dataAddResult,
            dataUpdateResult,
            dataDeleteResponse,
            message: defaultStatus
        })

    } catch (error) {
        console.log(error)
        if (t && !t.finished) await t.rollback();
        next(error)
    }
}

controller.addDetailLocationWork = async (req, res, next) => {
    // const { id_profile, id_location, is_default } = req.body
    const data = req.body
    try {
        let paramInsertTable = []
        let is_default_value = ["Y", "N"]

        for (let i = 0; i <= data.length - 1; i++) {
            if (!data[i].id_profile) {
                throw new ErrorResponse("Please insert id_profile", 400)
            }
    
            if (!data[i].id_location) {
                throw new ErrorResponse("Please insert id_location", 400)
            }
    
            if (!data[i].is_default) {
                throw new ErrorResponse("Please insert is_default", 400)
            }
            
            console.log("is_default.includes(is_default_value)", is_default_value.includes(data[i].is_default))
            if (!(is_default_value.includes(data[i].is_default))) {
                throw new ErrorResponse("is_default value must be Y or N", 400)
            }
    
            if (data[i].is_default === "Y") {
                let checkDefault = await model.detail_location_work.findOne({
                    where: {
                        id_location: data[i].id_location,
                        is_default: "Y"
                    }
                })
        
                if (checkDefault) {
                    throw new ErrorResponse("Location already have default marketing", 400)
                }
            }

            let checkExisting = await model.detail_location_work.findOne({
                where: {
                    id_profile: data[i].id_profile,
                    id_location: data[i].id_location,
                    is_default: data[i].is_default
                }
            })

            if (!checkExisting) {
                paramInsertTable.push({
                    id_profile: data[i].id_profile,
                    id_location: data[i].id_location,
                    is_default: data[i].is_default
                })
            }
        }

        console.log("paramInsertTable", paramInsertTable)
        let insertLocationWork = await model.detail_location_work.bulkCreate(paramInsertTable)
        
        responseStatus.resCreated(res, insertLocationWork)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.deleteDetailWork = async (req, res, next) => {
    let { id } = req.body

    if (typeof (id) == "string") {
        id = JSON.parse(id)
    }

    try {
        let deleteDetailWork = await model.detail_location_work.destroy({
            where: {
                id_detail_location_work: id
            }
        })
        responseStatus.resOK(res, deleteDetailWork)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.getOneDetailLocationWork = async (req, res, next) => {
    const { id_detail_location_work } = req.body
    try {
        if (!id_detail_location_work) {
            throw new ErrorResponse("Please insert id!")
        }

        let findLocationWork = await model.detail_location_work.findOne({
            where: {
                id_detail_location_work: id_detail_location_work
            }
        })

        if (!findLocationWork) {
            responseStatus.resNotFound(res, "Data not found!")
        }

        responseStatus.resOK(res, findLocationWork)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.getAllDetailLocationWork = async (req, res, next) => {
    let { page, size, id_profile, id_location, is_default } = req.body
    try {
        let getPagination = (page, size) => {
            const limit = size ? +size : 0;
            const offset = page ? 0 + (page - 1) * limit : 0;
            return { limit, offset };
        };

        let limit = getPagination(page, size).limit;
        let offset = getPagination(page, size).offset;

        let search = {
            // limit,
            // offset,
            where: {
                // [Op.or]: [
                // ]
            },
            include: [
                {
                    model: model.mst_location,
                    attributes: [["location_name", "location_name"]],
                    required: true
                }
            ],
            raw: true,
            logging: console.log
        }

        if (limit != 0 || offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        search.where[Op.and] = []

        if (id_profile) {
            search.where[Op.and].push(
                { id_profile: id_profile }
            )
        }

        if (id_location) {
            search.where[Op.and].push(
                { id_location: id_location }
            )
        }

        if (is_default) {
            search.where[Op.and].push(
                { is_default: is_default }
            )
        }

        let detailLocationWork = await model.detail_location_work.findAndCountAll(search);

        if (!detailLocationWork || detailLocationWork.rows.length < 1) {
            throw new ErrorResponse("Data not found!", 404)
        }

        return responseStatus.resOK(res, detailLocationWork)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.getLocationDefault = async (req, res, next) => {
    const { id_profile } = req.body
    try {
        let locationDefault = await db.query(`select id_location, location_name, case when id_marketing != ${id_profile} and is_default = 'Y' then 'Y' else 'N' end as "flag" from v_detail_location_work`, 
        { type: QueryTypes.SELECT })

        return responseStatus.resOK(res, locationDefault)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = controller;