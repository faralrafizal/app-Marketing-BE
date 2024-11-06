const path = require("path");
const asynco = require("async");
const axios = require("axios").default;
const Sequelize = require("sequelize");
const { Op } = require("sequelize");

//database
const db = require("../../config/database/database");
const fs = require("fs");
const model = require("../../config/models/index");
const jwt = require("jsonwebtoken");
const ErrorResponse = require("../../utils/errorResponse")
const responseStatus = require("../../utils/responseStatus")
const { encrypt, decrypt } = require("../../utils/bcrypt");
let ejs = require("ejs");
const socketApi = require("../../middleware/socketApi");

const controller = {}

controller.getAllMarketing = async (req, res, next) => {
    let { id_location, page, size, searchWord } = req.body
    try {
        let getPagination = (page, size) => {
            const limit = size ? +size : 0;
            const offset = page ? 0 + (page - 1) * limit : 0;
            return { limit, offset };
        }

        let limit = getPagination(page, size).limit;
        let offset = getPagination(page, size).offset;

        let search = {
            // limit,
            // offset,
            where: {
                [Op.and]: []
            },
            logging: console.log
        }

        if (limit !== 0 && offset !== 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.and] = []
            search.where[Op.and].push(
                db.where(db.fn("lower", db.col("employee_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                })
            )
        }

        if (id_location) {
            search.where[Op.and].push(
                { id_location: id_location }
            )
        }

        let marketing = await model.mst_profile.findAndCountAll(search)

        console.log("marketing.rows.length", marketing.rows.length)

        if (!marketing || marketing.rows.length < 1) {
            return responseStatus.resNotFound(res, "Data marketing not found!")
        }

        return responseStatus.resOK(res, marketing)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.getDataCoordinator = async (req, res, next) => {
    let { id_location } = req.query

    try {
        let search = {
            // limit,
            // offset,
            where: {
                [Op.and]: []
            },
            logging: console.log
        }

        if (id_location) {
            search.where[Op.and].push(
                { id_location: id_location }
            )
        }

        let dataCoordinator = await model.v_all_profile.findAll(search)

        if (dataCoordinator.length > 0) {
            responseStatus.resOK(res, dataCoordinator)
        } else {
            responseStatus.resNotFound(res, "Data not found!")
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.getDataMarketingCoordinator = async (req, res, next) => {
    let { id_leader } = req.query
    try {

        let search = {
            // limit,
            // offset,
            where: {
                [Op.and]: [
                    {
                        status: {
                            [Op.not]: 'non active'
                        }
                    }
                ]
            },
            logging: console.log
        }

        if (id_leader) {
            search.where[Op.and].push(
                { id_leader: id_leader }
            )
        }

        let findDataMarketing = await model.v_all_structure_organ.findAndCountAll(search)

        if (findDataMarketing.rows.length > 0) {
            responseStatus.resOK(res, findDataMarketing)
        } else {
            responseStatus.resNotFound(res, "Data not found!")
        }
    } catch (error) {
        next(error)
    }
}

controller.findDataCoordinator = async (req, res, next) => {
    let { id_location, searchWord } = req.body

    try {
        let search = {
            // limit,
            // offset,
            where: {
                [Op.and]: []
            },
            logging: console.log
        }

        if (id_location) {
            search.where[Op.and].push(
                { id_location: id_location }
            )
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("employee_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            )
        }

        let dataCoordinator = await model.v_all_profile.findAll(search)

        if (dataCoordinator.length > 0) {
            responseStatus.resOK(res, dataCoordinator)
        } else {
            responseStatus.resNotFound(res, "Data not found!")
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.findDataMarketingCoordinator = async (req, res, next) => {
    let { id_leader, searchWord } = req.body
    try {

        let search = {
            // limit,
            // offset,
            where: {
                [Op.and]: [
                    {
                        status: {
                            [Op.not]: 'non active'
                        }
                    }
                ]
            },
            logging: console.log
        }

        if (id_leader) {
            search.where[Op.and].push(
                { id_leader: id_leader }
            )
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("profile_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            )
        }

        let findDataMarketing = await model.v_all_structure_organ.findAndCountAll(search)

        if (findDataMarketing.rows.length > 0) {
            responseStatus.resOK(res, findDataMarketing)
        } else {
            responseStatus.resNotFound(res, "Data not found!")
        }
    } catch (error) {
        next(error)
    }
}

//Mobile
controller.getAllMarketingMobile = async (req, res, next) => {
    let { id_location, page, size, searchWord } = req.body
    try {
        let getPagination = (page, size) => {
            const limit = size ? +size : 0;
            const offset = page ? 0 + (page - 1) * limit : 0;
            return { limit, offset };
        }

        let limit = getPagination(page, size).limit;
        let offset = getPagination(page, size).offset;

        let search = {
            // limit,
            // offset,
            where: {
                [Op.and]: []
            },
            logging: console.log
        }

        if (limit !== 0 && offset !== 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.and] = []
            search.where[Op.and].push(
                db.where(db.fn("lower", db.col("employee_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                })
            )
        }

        if (id_location) {
            search.where[Op.and].push(
                { id_location: id_location }
            )
        }

        let marketing = await model.mst_profile.findAndCountAll(search)

        console.log("marketing.rows.length", marketing.rows.length)

        if (!marketing || marketing.rows.length < 1) {
            return responseStatus.resNotFound(res, "Data marketing not found!")
        }

        return responseStatus.resOK(res, marketing)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.getDataCoordinatorMobile = async (req, res, next) => {
    let { id_location } = req.query

    try {
        let search = {
            // limit,
            // offset,
            where: {
                [Op.and]: []
            },
            logging: console.log
        }

        if (id_location) {
            search.where[Op.and].push(
                { id_location: id_location }
            )
        }

        let dataCoordinator = await model.v_all_profile.findAll(search)

        if (dataCoordinator.rows.length > 0) {
            responseStatus.resOK(res, dataCoordinator)
        } else {
            responseStatus.resNotFound(res, "Data not found!")
        }
    } catch (error) {
        next(error)
    }
}

controller.getDataMarketingCoordinatorMobile = async (req, res, next) => {
    let { id_leader } = req.query
    try {

        let search = {
            // limit,
            // offset,
            where: {
                [Op.and]: [
                    { status: null }
                ]
            },
            logging: console.log
        }

        if (id_leader) {
            search.where[Op.and].push(
                { id_leader: id_leader }
            )
        }

        let findDataMarketing = await model.v_all_structure_organ.findAndCountAll(search)

        if (findDataMarketing.rows.length > 0) {
            responseStatus.resOK(res, findDataMarketing)
        } else {
            responseStatus.resNotFound(res, "Data not found!")
        }
    } catch (error) {
        next(error)
    }
}

controller.getMarketingCoordinatorLocation = async (req, res, next) => {
    let { id_location } = req.query
    try {
        let search = {
            // limit,
            // offset,
            where: {
                [Op.and]: []
            },
            logging: console.log
        }

        if (id_location) {
            search.where[Op.and].push(
                { id_location: id_location }
            )
        }

        let findData = await model.v_detail_location_work.findAll(search)
        if (findData.length > 0) {
            responseStatus.resOK(res, findData)
        } else {
            responseStatus.resNotFound(res, "Data not found!")
        }
    } catch (error) {
        next(error)
    }
}

module.exports = controller;