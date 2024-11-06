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

controller.miniDashboard = async (req, res, next) => {
    try {
        let allProjectValue = 0
        let sumContract = 0
        let sum100 = 0
        let sum75 = 0
        let sum50 = 0
        let sum25 = 0
        let sum0 = 0

        

        // let allProjectValue = await model.v_all_project.sum('project_value');

        let searchProjectValue = [
            db.where(db.fn("date_part", 'year', db.col('updated_at')), new Date().getFullYear()),
            { flag: "actual" }, 
            { id_status: { [Op.not]: null } }
        ]

        let searchContractVallue = [
            db.where(db.fn("date_part", 'year', db.col('updated_at')), new Date().getFullYear()),
            { flag: "actual" },
            { progress_description: "Contract" }
        ]

        let search100 = [
            db.where(db.fn("date_part", 'year', db.col('updated_at')), new Date().getFullYear()),
            { flag: "actual" },
            { progress_value: "100" }
        ]
        
        let search75 = [
            db.where(db.fn("date_part", 'year', db.col('updated_at')), new Date().getFullYear()),
            { flag: "actual" },
            { progress_value: "75" }
        ]

        let search50 = [
            db.where(db.fn("date_part", 'year', db.col('updated_at')), new Date().getFullYear()),
            { flag: "actual" },
            { progress_value: "50" }
        ]

        let search25 = [
            db.where(db.fn("date_part", 'year', db.col('updated_at')), new Date().getFullYear()),
            { flag: "actual" },
            { progress_value: "25" }
        ]

        let search0 = [
            db.where(db.fn("date_part", 'year', db.col('updated_at')), new Date().getFullYear()),
            { flag: "actual" },
            { progress_value: "0" }
        ]
        
        if (!(req.role_level == 'Direktur' || req.role_level == 'Superadmin' || req.role_level == 'Admin')) {
            searchProjectValue.push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })

            searchContractVallue.push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })

            
            search100.push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })

            search75.push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })

            search50.push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })

            search25.push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })

            search0.push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })

        }

        let getAllProjectValue = await model.v_all_project.findAll({
            where: searchProjectValue
        })

        getAllProjectValue.forEach((data) => {
            allProjectValue += +data.pagu
        })

        let totalContract = await model.v_all_project.findAll({
            where: searchContractVallue 
        })

        totalContract.forEach((data) => {
            sumContract += +data.pagu
        })

        let total100 = await model.v_all_project.findAll({
            where: search100 
        })

        //console.log(total100, "=========")
        total100.forEach((data) => {
            sum100 += +data.pagu
        })

        let total75 = await model.v_all_project.findAll({
            where: search75
        })
        console.log(total75, "=========")
        total75.forEach((data) => {
            sum75 += +data.pagu
        })

        let total50 = await model.v_all_project.findAll({
            where: search50
        })

        total50.forEach((data) => {
            sum50 += +data.pagu
        })

        let total25 = await model.v_all_project.findAll({
            where: search25
        })

        total25.forEach((data) => {
            sum25 += +data.pagu
        })
        console.log(total25, "=========")
        let total0 = await model.v_all_project.findAll({
            where: search0
        })

        total0.forEach((data) => {
            sum0 += +data.pagu
        })

        let miniDashboardValue = {
            allProjectValue: allProjectValue,
            contract: sumContract,
            total100: sum100,
            total75: sum75,
            total50: sum50,
            total25: sum25,
            total0: sum0
        }

        return responseStatus.resOK(res, miniDashboardValue)
    } catch (error) {
        console.log(error)
        next(error)
        throw new ErrorResponse(error, 400)
    }
}
controller.dataTableDashboard = async (req, res, next) => {
    let { status, page, size, lang, searchWord, filter, sort } = req.body
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
            logging: console.log
        }

        console.log("limit", limit)
        console.log("offset", offset)

        if (limit !== 0 || offset !== 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("project_code")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("package")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            )
        }

        search.where[Op.and] =
        [
            db.where(db.fn("date_part", 'year', db.col('updated_at')), new Date().getFullYear()),
            { flag: "actual" }
        ]

        if (!(req.role_level == 'Direktur' || req.role_level == 'Superadmin' || req.role_level == 'Admin')) {
            search.where[Op.and].push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })
        }

        if (filter?.company && filter?.company?.length > 0) {
            const filterCompany = filter?.company
            .filter(data => data !== "All")
            .map(data => data.toLowerCase());
            
            if (filterCompany.length > 0) {
                search.where[Op.and].push(
                    db.where(db.fn("lower", db.col("company")), {
                        [Op.in]: filterCompany,
                    })
                );
            }
        }

        if (filter?.sourceDocument && filter?.sourceDocument?.length > 0) {
            const filterSourceDocument = filter?.sourceDocument
            .filter(data => data !== "All")
            
            if (filterSourceDocument.length > 0) {
                search.where[Op.and].push(
                    db.where(db.col("source_document"), {
                        [Op.in]: filterSourceDocument,
                    })
                );
            }
        }

        if (filter?.status && filter?.status.length > 0) {
            const filterStatus = filter?.status.filter(status => status !== "All");
        
            let progressValueClause = null;
            let progressDescriptionClause = null;
        
            if (filterStatus.includes("Kontrak")) {
                progressDescriptionClause = db.where(
                    db.col("progress_description"),
                    "contract"
                );
        
                const otherStatuses = filterStatus.filter(status => status !== "Kontrak");
                if (otherStatuses.length > 0) {
                    progressValueClause = db.where(db.col("progress_value"), {
                        [Op.in]: otherStatuses,
                    });
                }
            } else {
                progressValueClause = db.where(db.col("progress_value"), {
                    [Op.in]: filterStatus,
                });
            }
        
            if (progressValueClause && progressDescriptionClause) {
                search.where[Op.and].push({
                    [Op.or]: [progressValueClause, progressDescriptionClause],
                });
            } else if (progressValueClause) {
                search.where[Op.and].push(progressValueClause);
            } else if (progressDescriptionClause) {
                search.where[Op.and].push(progressDescriptionClause);
            }
        }

        if (filter?.marketing && filter?.marketing?.length > 0) {
            const filterMarketing = filter?.marketing
            .filter(data => data !== "All")
            
            if (filterMarketing.length > 0) {
                search.where[Op.and].push(
                    db.where(db.col("id_marketing"), {
                        [Op.in]: filterMarketing,
                    })
                );
            }
        }

        if (filter?.coordinator && filter?.coordinator?.length > 0) {
            const filterCoordinator = filter?.coordinator
            .filter(data => data !== "All")
            
            if (filterCoordinator.length > 0) {
                search.where[Op.and].push(
                    db.where(db.col("coordinator"), {
                        [Op.in]: filterCoordinator,
                    })
                );
            }
        }

        if (filter?.customer && filter?.customer?.length > 0) {
            const filterCustomer = filter?.customer
            .filter(data => data !== "All")
            
            if (filterCustomer.length > 0) {
                search.where[Op.and].push(
                    db.where(db.col("klpd"), {
                        [Op.in]: filterCustomer,
                    })
                );
            }
        }

        if (sort && ["asc", "desc"].includes(sort)) {
            search.order = [["updated_at", sort]]
        }

        let result = await model.v_all_project.findAndCountAll(search);

        return responseStatus.resOK(res, result)
    } catch (error) {
        console.log(error)
        next(error)
        throw new ErrorResponse(error, 400)
    }
}
controller.getAllMarketingCoordinator = async (req, res, next) => {
    try {
        let marketing = await db.query(
            "select distinct vap.id_marketing, mp.employee_name from v_all_project vap join mst_profile mp on vap.id_marketing = mp.id_profile where vap.id_marketing is not null",
            { type: Sequelize.QueryTypes.SELECT }
        )

        let coordinator = await db.query(
            "select distinct vap.coordinator, mp.employee_name from v_all_project vap join mst_profile mp on vap.coordinator = mp.id_profile where vap.coordinator is not null",
            { type: Sequelize.QueryTypes.SELECT }
        )
        
        let customer = await db.query(
            "select distinct klpd from v_all_project vap where klpd is not null",
            { type: Sequelize.QueryTypes.SELECT }
        )

        let result = {
            marketing: marketing,
            coordinator: coordinator,
            customer : customer
        }

        return responseStatus.resOK(res, result)
    } catch (error) {
        console.log(error)
        next(error)
        throw new ErrorResponse(error, 400)
    }
}

// Mobile
controller.miniDashboardMobile = async (req, res, next) => {
    try {
        let allProjectValue = 0
        let sumContract = 0
        let sum100 = 0
        let sum75 = 0
        let sum50 = 0
        let sum25 = 0
        let sum0 = 0

        

        // let allProjectValue = await model.v_all_project.sum('project_value');

        let searchProjectValue = [
            db.where(db.fn("date_part", 'year', db.col('updated_at')), new Date().getFullYear()),
            { flag: "actual" }, 
            { id_status: { [Op.not]: null } }
        ]

        let searchContractVallue = [
            db.where(db.fn("date_part", 'year', db.col('updated_at')), new Date().getFullYear()),
            { flag: "actual" },
            { progress_description: "Contract" }
        ]

        let search100 = [
            db.where(db.fn("date_part", 'year', db.col('updated_at')), new Date().getFullYear()),
            { flag: "actual" },
            { progress_value: "100" }
        ]
        
        let search75 = [
            db.where(db.fn("date_part", 'year', db.col('updated_at')), new Date().getFullYear()),
            { flag: "actual" },
            { progress_value: "75" }
        ]

        let search50 = [
            db.where(db.fn("date_part", 'year', db.col('updated_at')), new Date().getFullYear()),
            { flag: "actual" },
            { progress_value: "50" }
        ]

        let search25 = [
            db.where(db.fn("date_part", 'year', db.col('updated_at')), new Date().getFullYear()),
            { flag: "actual" },
            { progress_value: "25" }
        ]

        let search0 = [
            db.where(db.fn("date_part", 'year', db.col('updated_at')), new Date().getFullYear()),
            { flag: "actual" },
            { progress_value: "0" }
        ]
        
        if (!(req.role_level == 'Direktur' || req.role_level == 'Superadmin' || req.role_level == 'Admin')) {
            searchProjectValue.push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })

            searchContractVallue.push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })

            
            search100.push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })

            search75.push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })

            search50.push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })

            search25.push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })

            search0.push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })

        }

        let getAllProjectValue = await model.v_all_project.findAll({
            where: searchProjectValue
        })

        getAllProjectValue.forEach((data) => {
            allProjectValue += +data.pagu
        })

        let totalContract = await model.v_all_project.findAll({
            where: searchContractVallue 
        })

        totalContract.forEach((data) => {
            sumContract += +data.pagu
        })

        let total100 = await model.v_all_project.findAll({
            where: search100 
        })

        //console.log(total100, "=========")
        total100.forEach((data) => {
            sum100 += +data.pagu
        })

        let total75 = await model.v_all_project.findAll({
            where: search75
        })
        console.log(total75, "=========")
        total75.forEach((data) => {
            sum75 += +data.pagu
        })

        let total50 = await model.v_all_project.findAll({
            where: search50
        })

        total50.forEach((data) => {
            sum50 += +data.pagu
        })

        let total25 = await model.v_all_project.findAll({
            where: search25
        })

        total25.forEach((data) => {
            sum25 += +data.pagu
        })
        console.log(total25, "=========")
        let total0 = await model.v_all_project.findAll({
            where: search0
        })

        total0.forEach((data) => {
            sum0 += +data.pagu
        })

        let miniDashboardValue = {
            allProjectValue: allProjectValue,
            contract: sumContract,
            total100: sum100,
            total75: sum75,
            total50: sum50,
            total25: sum25,
            total0: sum0
        }

        return responseStatus.resOK(res, miniDashboardValue)
    } catch (error) {
        console.log(error)
        next(error)
        throw new ErrorResponse(error, 400)
    }
}
controller.dataTableDashboardMobile = async (req, res, next) => {
    let { status, page, size, lang, searchWord, filter, sort } = req.body
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
            logging: console.log
        }

        console.log("limit", limit)
        console.log("offset", offset)

        if (limit !== 0 || offset !== 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("project_code")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("package")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            )
        }

        search.where[Op.and] =
        [
            db.where(db.fn("date_part", 'year', db.col('updated_at')), new Date().getFullYear()),
            { flag: "actual" }
        ]

        if (!(req.role_level == 'Direktur' || req.role_level == 'Superadmin' || req.role_level == 'Admin')) {
            search.where[Op.and].push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })
        }
        
        if (filter?.company && filter?.company?.length > 0) {
            const filterCompany = filter?.company
            .filter(data => data !== "All")
            .map(data => data.toLowerCase());
            
            if (filterCompany.length > 0) {
                search.where[Op.and].push(
                    db.where(db.fn("lower", db.col("company")), {
                        [Op.in]: filterCompany,
                    })
                );
            }
        }

        if (filter?.sourceDocument && filter?.sourceDocument?.length > 0) {
            const filterSourceDocument = filter?.sourceDocument
            .filter(data => data !== "All")
            
            if (filterSourceDocument.length > 0) {
                search.where[Op.and].push(
                    db.where(db.col("source_document"), {
                        [Op.in]: filterSourceDocument,
                    })
                );
            }
        }

        if (filter?.status && filter?.status.length > 0) {
            const filterStatus = filter?.status.filter(status => status !== "All");
        
            let progressValueClause = null;
            let progressDescriptionClause = null;
        
            if (filterStatus.includes("Kontrak")) {
                progressDescriptionClause = db.where(
                    db.col("progress_description"),
                    "contract"
                );
        
                const otherStatuses = filterStatus.filter(status => status !== "Kontrak");
                if (otherStatuses.length > 0) {
                    progressValueClause = db.where(db.col("progress_value"), {
                        [Op.in]: otherStatuses,
                    });
                }
            } else {
                progressValueClause = db.where(db.col("progress_value"), {
                    [Op.in]: filterStatus,
                });
            }
        
            if (progressValueClause && progressDescriptionClause) {
                search.where[Op.and].push({
                    [Op.or]: [progressValueClause, progressDescriptionClause],
                });
            } else if (progressValueClause) {
                search.where[Op.and].push(progressValueClause);
            } else if (progressDescriptionClause) {
                search.where[Op.and].push(progressDescriptionClause);
            }
        }

        if (filter?.marketing && filter?.marketing?.length > 0) {
            const filterMarketing = filter?.marketing
            .filter(data => data !== "All")
            
            if (filterMarketing.length > 0) {
                search.where[Op.and].push(
                    db.where(db.col("id_marketing"), {
                        [Op.in]: filterMarketing,
                    })
                );
            }
        }

        if (filter?.coordinator && filter?.coordinator?.length > 0) {
            const filterCoordinator = filter?.coordinator
            .filter(data => data !== "All")
            
            if (filterCoordinator.length > 0) {
                search.where[Op.and].push(
                    db.where(db.col("coordinator"), {
                        [Op.in]: filterCoordinator,
                    })
                );
            }
        }

        if (filter?.customer && filter?.customer?.length > 0) {
            const filterCustomer = filter?.customer
            .filter(data => data !== "All")
            
            if (filterCustomer.length > 0) {
                search.where[Op.and].push(
                    db.where(db.col("klpd"), {
                        [Op.in]: filterCustomer,
                    })
                );
            }
        }

        if (sort && ["asc", "desc"].includes(sort)) {
            search.order = [["updated_at", sort]]
        }

        let result = await model.v_all_project.findAndCountAll(search);

        return responseStatus.resOK(res, result)
    } catch (error) {
        console.log(error)
        next(error)
        throw new ErrorResponse(error, 400)
    }
}
controller.getAllMarketingCoordinatorMobile = async (req, res, next) => {
    try {
        let marketing = await db.query(
            "select distinct vap.id_marketing, mp.employee_name from v_all_project vap join mst_profile mp on vap.id_marketing = mp.id_profile where vap.id_marketing is not null",
            { type: Sequelize.QueryTypes.SELECT }
        )

        let coordinator = await db.query(
            "select distinct vap.coordinator, mp.employee_name from v_all_project vap join mst_profile mp on vap.coordinator = mp.id_profile where vap.coordinator is not null",
            { type: Sequelize.QueryTypes.SELECT }
        )
        
        let customer = await db.query(
            "select distinct klpd from v_all_project vap where klpd is not null",
            { type: Sequelize.QueryTypes.SELECT }
        )

        let result = {
            marketing: marketing,
            coordinator: coordinator,
            customer : customer
        }

        return responseStatus.resOK(res, result)
    } catch (error) {
        console.log(error)
        next(error)
        throw new ErrorResponse(error, 400)
    }
}

module.exports = controller