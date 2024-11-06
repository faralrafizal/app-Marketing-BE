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

controller.getAllMstDoc = async (req, res, next) => {
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

        if (limit != 0 || offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("document_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                // { ROLE_NAME: { $like: `${searchWord}%`} }
            )
        }

        let dataDocument = await model.mst_document.findAndCountAll(search)
        if (dataDocument.rows.length > 0) {
            responseStatus.resOK(res, dataDocument)
        } else {
            responseStatus.resNotFound(res, "Data document Empty")
        }
    } catch (error) {
        next(error)
    }
}

controller.getOneMstDoc = async (req, res, next) => {
    let { id_document, doc_name } = req.query
    try {
        let condition = {
            where: {

            }
        }
        if (id_document || doc_name) {
            condition.where[Op.and] = []
        }

        if (id_document) {
            condition.where[Op.and].push(
                { id_document: id_document }
            )
        }

        if (doc_name) {
            condition.where[Op.and].push(
                { document_name: doc_name }
            )
        }
        let dataOneDocument = await model.mst_document.findOne(condition)

        if (dataOneDocument) {
            responseStatus.resOK(res, dataOneDocument)
        } else {
            responseStatus.resNotFound(res, "Data Document Not Found")
        }
    } catch (error) {
        next(error)
    }
}

controller.checkDocument = async (req, res, next) => {
    let { doc_name } = req.query
    try {
        let dataOneDocument = await model.mst_document.findOne({
            where: {
                document_name: doc_name
            }
        })

        if (dataOneDocument) {
            if (dataOneDocument.approval === true) {
                responseStatus.resOK(res, { approval: dataOneDocument.approval, msg: "OK", status: 1 })
            } else {
                responseStatus.resOK(res, { approval: dataOneDocument.approval, msg: "Disable", status: 0 })
            }
        } else {
            responseStatus.resNotFound(res, "Data Document Not Found")
        }
    } catch (error) {
        next(error)
    }
}

controller.getAllProcurementType = async (req, res, next) => {
    let { page, size, lang, searchWord } = req.body
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

        if (limit != 0 || offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("type")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                // { ROLE_NAME: { $like: `${searchWord}%`} }
            )
        }
        let dataProcurementType = await model.mst_procurement_type.findAndCountAll(search);
        if (dataProcurementType.rows.length > 0) {
            responseStatus.resOK(res, dataProcurementType);
        } else {
            responseStatus.resNotFound(res, "Data Procurement type Empty")
        }
    } catch (err) {
        next(err)
    }
}

controller.getOneProcurementType = async (req, res, next) => {
    let { id_procurement_type } = req.query
    try {
        let dataProcurementType = await model.mst_procurement_type.findOne({
            where: {
                [Op.or]: [
                    { id_procurement_type: id_procurement_type }
                ]
            }
        })

        if (dataProcurementType) {
            responseStatus.resOK(res, dataProcurementType)
        } else {
            responseStatus.resNotFound(res, "Data Procurement type Not Found")
        }
    } catch (err) {
        next(err)
    }
}

controller.getAllProvince = async (req, res, next) => {
    let { page, size, lang, searchWord } = req.body
    try {
        let getPagination = (page, size) => {
            const limit = size ? +size : 0;
            const offset = page ? 0 + (page - 1) * limit : 0;
            return { limit, offset };
        };

        let limit = getPagination(page, size).limit;
        let offset = getPagination(page, size).offset;

        console.log("limit", limit)
        console.log("offset", offset)

        let search = {
            // limit,
            // offset,
            where: {
                // [Op.or]: [
                // ]
            },
            logging: console.log
        }

        if (limit !== 0 || offset !== 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("province_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            )
        }

        let province = await model.mst_province.findAndCountAll(search);

        if (!province || province.rows.length < 1) {
            throw new ErrorResponse("Data not found!", 404)
        }

        responseStatus.resOK(res, province)
    } catch (error) {
        console.log(error)
        next(error)
    }
}
controller.getListLocation = async (req, res, next) => {
    let { page, size, lang, searchWord } = req.body
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

        if (limit !== 0 && offset !== 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("location_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("province_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                // { ROLE_NAME: { $like: `${searchWord}%`} }
            )
        }
        let dataLocation = await model.v_location_province.findAndCountAll(search);
        if (dataLocation.rows.length > 0) {
            const provinceMap = new Map();

            dataLocation.rows.forEach((item) => {
                if (!provinceMap.has(item.province_name)) {
                    provinceMap.set(item.province_name, {
                        province_name: item.province_name,
                        id_province: item.id_province,
                        location: [],
                    });
                }

                provinceMap.get(item.province_name).location.push({
                    id_location: item.id_location,
                    location_name: item.location_name,
                });
            });

            const distinctData = [...provinceMap.values()];
            responseStatus.resOK(res, distinctData)
        } else {
            responseStatus.resNotFound(res, "Data Location Not Found")
        }
    } catch (err) {
        next(err)
    }
}

controller.getAllLocationCity = async (req, res, next) => {
    let { page, size, lang, searchWord } = req.body
    try {
        let getPagination = (page, size) => {
            const limit = size ? +size : 0;
            const offset = page ? 0 + (page - 1) * limit : 0;
            return { limit, offset };
        };

        let limit = getPagination(page, size).limit;
        let offset = getPagination(page, size).offset;

        console.log("limit", limit)
        console.log("offset", offset)

        let search = {
            // limit,
            // offset,
            where: {
                // [Op.or]: [
                // ]
            },
            logging: console.log
        }

        if (limit !== 0 || offset !== 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("location_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            )
        }

        let location = await model.v_location_province.findAndCountAll(search);

        if (!location || location.rows.length < 1) {
            throw new ErrorResponse("Data not found!", 404)
        }

        responseStatus.resOK(res, location)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.getAllKeyword = async (req, res, next) => {
    let { page, size, lang, searchWord } = req.body
    try {
        let getPagination = (page, size) => {
            const limit = size ? +size : 0;
            const offset = page ? 0 + (page - 1) * limit : 0;
            return { limit, offset };
        };

        let limit = getPagination(page, size).limit;
        let offset = getPagination(page, size).offset;

        console.log("limit", limit)
        console.log("offset", offset)

        let search = {
            // limit,
            // offset,
            where: {
                // [Op.or]: [
                // ]
            },
            logging: console.log
        }

        if (limit !== 0 || offset !== 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("keyword")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            )
        }

        let keyword = await model.mst_keyword.findAndCountAll(search);

        if (!keyword || keyword.rows.length < 1) {
            throw new ErrorResponse("Data not found!", 404)
        }

        responseStatus.resOK(res, keyword)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.getAllSubdis = async (req, res, next) => {
    let { page, size, lang, searchWord } = req.query
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

        if (limit != 0 || offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("sub_dis_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            )
        }

        let subdis = await model.mst_sub_dis.findAndCountAll(search);

        if (!subdis || subdis.rows.length < 1) {
            throw new ErrorResponse("Data not found!", 404)
        }

        responseStatus.resOK(res, subdis)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.getOneSubdis = async (req, res, next) => {
    let { id_sub_dis } = req.query
    try {
        if (!id_sub_dis) {
            throw new ErrorResponse("Please insert id_sub_dis!", 400)
        }

        let subdis = await model.mst_sub_dis.findOne({
            where: { id_sub_dis: id_sub_dis }
        })

        if (!subdis) {
            throw new ErrorResponse("Data not found!", 400)
        }

        responseStatus.resOK(res, subdis)
    } catch (error) {
        next(error)
        console.log(error)
    }
}

controller.createSubdis = async (req, res, next) => {
    let { sub_dis_name, id_location, id_coordinator } = req.body

    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });

    try {
        if (!sub_dis_name) {
            throw new ErrorResponse("Please insert sub_dis_name!", 400)
        }

        if (!id_location) {
            throw new ErrorResponse("Please insert id_location!", 400)
        }

        if (!id_coordinator) {
            throw new ErrorResponse("Please insert id_coordinator!", 400)
        }

        const procedureCall = "CALL insert_mst_sub_dis(:sub_dis_name, :id_location, :id_coordinator, :created_at, :created_by, :updated_at, :updated_by)";

        const parameter = {
            sub_dis_name: sub_dis_name ?? null,
            id_location: id_location ?? null,
            id_coordinator: id_coordinator ?? null,
            created_at: new Date(),
            created_by: req.username,
            updated_at: new Date(),
            updated_by: req.username,
            id_location: id_location ?? null
        }

        await db.query(procedureCall, {
            replacements: parameter,
            type: Sequelize.QueryTypes.RAW, // Use RAW query type for stored procedures
            transaction: t
        })

        await t.commit();
        console.log('Transaction committed successfully');

        return responseStatus.resOK(res, "Subdis created successfully")

        // .then((results) => {
        //     console.log('Procedure executed successfully:', results);
        //     return responseStatus.resCreated(res, parameter)
        // })
        // .catch((error) => {
        //     console.error('Error executing procedure:', error);
        //     return ErrorResponse(error, 400)
        // });
    } catch (error) {
        if (t) {
            await t.rollback();
            console.log('Transaction rolled back');
        }
        console.log(error);
        next(error)
    }
}

controller.editSubdis = async (req, res, next) => {
    let { id_sub_dis, sub_dis_name, id_location, id_coordinator } = req.body
    try {
        if (!id_sub_dis) {
            throw new ErrorResponse("Please insert id_sub_dis", 400)
        }

        const functionCall = "SELECT update_mst_sub_dis(:id_sub_dis, :sub_dis_name, :id_location, :id_coordinator, :updated_at, :updated_by)";

        const parameter = {
            id_sub_dis: id_sub_dis,
            sub_dis_name: sub_dis_name ?? null,
            id_location: id_location ?? null,
            id_coordinator: id_coordinator ?? null,
            updated_at: new Date(),
            updated_by: req.username,
        }

        db.query(functionCall, {
            replacements: parameter,
            type: Sequelize.QueryTypes.SELECT, // Use SELECT for function calls
        })
            .then((results) => {
                console.log('Function executed successfully:', results);
                return responseStatus.resCreated(res, results[0].update_mst_sub_dis);
            })
            .catch((error) => {
                console.error('Error executing function:', error);
                throw new ErrorResponse(error, 400)
            });
    } catch (error) {
        console.log(error)
        next(error)
        throw new ErrorResponse(error, 400)
    }
}

controller.deleteSubdis = async (req, res, next) => {
    let { id_sub_dis } = req.body
    let t = await db.transaction({
        autoCommit: false,
        autoCommitTransactionalOFF: true,
    });

    try {
        let findSubdis = await model.mst_sub_dis.findOne({
            where: {
                id_sub_dis: { [Op.in]: id_sub_dis }
            }, transaction: t
        })

        if (!findSubdis) {
            throw new ErrorResponse("Subdis not found", 404)
        }

        let deleteSubdis = await model.mst_sub_dis.destroy({
            where: { id_sub_dis: { [Op.in]: id_sub_dis } },
            transaction: t
        })

        await t.commit()

        return responseStatus.resOK(res, "Subdis deleted successfully")
    } catch (error) {
        console.log(error)
        if (t && !t.finished) await t.rollback();
        next(error)
    }
}

controller.getAllStatus = async (req, res, next) => {
    let { page, size, lang, searchWord } = req.query
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

        if (limit != 0 || offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("value")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            )
        }

        console.log("search", JSON.stringify(search))

        let status = await model.mst_status.findAndCountAll(search);

        if (!status || status.rows.length < 1) {
            throw new ErrorResponse("Data not found!", 404)
        }

        status.rows = status.rows.sort((a, b) => {
            // Function to check if a value is a number
            const isNumber = value => !isNaN(parseFloat(value)) && isFinite(value);

            const aValue = isNumber(a.value) ? parseInt(a.value, 10) : a.value === "Contract" ? Infinity : -1;
            const bValue = isNumber(b.value) ? parseInt(b.value, 10) : b.value === "Contract" ? Infinity : -1;

            return aValue - bValue;
        });

        responseStatus.resOK(res, status)
    } catch (error) {
        console.log(error)
        next(error)
    }
}
// Keyword
controller.getOneKeyword = async (req, res, next) => {
    let { id } = req.query
    try {
        let keyword = await model.mst_keyword.findOne({
            where: {
                id_keyword: id
            }
        });
        if (keyword) {
            responseStatus.resOK(res, keyword)
        } else {
            responseStatus.resNotFound(res, "Data Keyword Not Found")
        }
    } catch (error) {
        next(error)
    }
}

controller.addKeyword = async (req, res, next) => {
    let { keyword } = req.body
    try {
        let find = await model.mst_keyword.findOne({
            where: Sequelize.literal(`LOWER("keyword") = LOWER('${keyword}')`)
        });
        if(find){
            return responseStatus.resBadRequest(res,"The data already exists.")
        } else {
            let addKeyword = await model.mst_keyword.create({
                keyword: keyword
            })
            responseStatus.resCreated(res, addKeyword)
        }  
    } catch (error) {
        next(error)
    }
}

controller.deleteKeyword = async (req, res, next) => {
    let { id } = req.query
    try {
        let deleteKeyword = await model.mst_keyword.destroy({
            where: {
                id_keyword: id
            }
        })
        responseStatus.resCreated(res, deleteKeyword)
    } catch (error) {
        next(error)
    }
}

controller.editKeyword = async (req, res, next) => {
    let { id, keyword } = req.body
    try {

        if (!id || !keyword) {
            responseStatus.resBadRequest(res, "Bad Request, Input False")
        } else {
            let find = await model.mst_keyword.findOne({
                where: Sequelize.literal(`LOWER("keyword") = LOWER('${keyword}')`)
            });
            if(find){
                responseStatus.resBadRequest(res, `Data already exists`)
            } else {
                let updateKeyword = await model.mst_keyword.update({
                    keyword: keyword
                }, {
                    where: {
                        id_keyword: id
                    }
                })
                responseStatus.resCreated(res, updateKeyword)
            } 
        }
    } catch (error) {
        next(error)
    }
}
// procurement_type

// controller.getOneProcurementType= async (req, res, next) =>{
//     let {id} = req.query
//     try {
//         let procurementType = await model.mst_procurement_type.findAndCountAll({
//             where : {
//                 id_procurement_type : id
//             }
//         });
//         if(procurementType){
//             responseStatus.resOK(res, procurementType)
//         } else {
//             responseStatus.resNotFound(res, "Data Procurement Type Not Found")
//         }
//     } catch (error) {
//         next (error)
//     }
// }

controller.addProcurementType = async (req, res, next) => {
    let { type } = req.body
    try {
        let find = await model.mst_procurement_type.findOne({
            where: Sequelize.literal(`LOWER("type") = LOWER('${type}')`)
        });
        if(find){
            responseStatus.resBadRequest(res, `Data already exists`)
        } else{
            let addProcurementType = await model.mst_procurement_type.create({
                type: type
            })
            responseStatus.resCreated(res, addProcurementType)
        }
    } catch (error) {
        next(error)
    }
}

controller.deleteProcurementType = async (req, res, next) => {
    let { id } = req.query
    try {
        let deleteProcurementType = await model.mst_procurement_type.destroy({
            where: {
                id_procurement_type: id
            }
        })
        responseStatus.resCreated(res, deleteProcurementType)
    } catch (error) {
        next(error)
    }
}

controller.editProcurement = async (req, res, next) => {
    let { id, type } = req.body
    try {

        if (!id || !type) {
            responseStatus.resBadRequest(res, "Bad Request, Input False")
        } else {
            let find = await model.mst_procurement_type.findOne({
                where: Sequelize.literal(`LOWER("type") = LOWER('${type}')`)
            });
            if(find){
                responseStatus.resBadRequest(res, `Data already exists`)
            } else {
                let updateProcurement = await model.mst_procurement_type.update({
                    type: type
                }, {
                    where: {
                        id_procurement_type: id
                    }
                })
                responseStatus.resCreated(res, updateProcurement)
            }
        }
    } catch (error) {
        next(error)
    }
}

// Location

controller.getOneLocation = async (req, res, next) => {
    let { id } = req.query
    try {
        let location = await model.mst_location.findOne({
            where: {
                id_location: id
            }
        });
        if (location) {
            responseStatus.resOK(res, location)
        } else {
            responseStatus.resNotFound(res, "Data Location Not Found")
        }
    } catch (error) {
        next(error)
    }
}

controller.addLocation = async (req, res, next) => {
    let { id_prov, loc } = req.body
    try {
        let find = await model.mst_location.findOne({
            where: Sequelize.literal(`LOWER("location_name") = LOWER('${loc}') AND "id_province" = ${id_prov}`)
        });
        if(find){
            responseStatus.resBadRequest(res, `Data already exists`)
        } else {
            let addLocation = await model.mst_location.create({
                id_province: id_prov,
                location_name: loc
            })
            responseStatus.resCreated(res, addLocation)
        }
    } catch (error) {
        next(error)
    }
}

controller.deleteLocation = async (req, res, next) => {
    let { id } = req.query
    try {
        let deleteLocation = await model.mst_location.destroy({
            where: {
                id_location: id
            }
        })
        responseStatus.resCreated(res, deleteLocation)
    } catch (error) {
        next(error)
    }
}

controller.editLocation = async (req, res, next) => {
    let { id, loc, id_prov } = req.body
    try {

        if (!id || !loc || !id_prov) {
            responseStatus.resBadRequest(res, "Bad Request, Input False")
        } else {
            let find = await model.mst_location.findOne({
                where: Sequelize.literal(`LOWER("location_name") = LOWER('${loc}') AND "id_province" = ${id_prov}`)
            });
            if(find){
                responseStatus.resBadRequest(res, `Data already exists`)
            } else {
                let updateLocation = await model.mst_location.update({
                    id_province: id_prov,
                    location_name: loc
                }, {
                    where: {
                        id_location: id
                    }
                })
                responseStatus.resCreated(res, updateLocation)
            }
        }
    } catch (error) {
        next(error)
    }
}

// Mobile
controller.getAllMstDocMobile = async (req, res, next) => {
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

        if (limit != 0 || offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("document_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                // { ROLE_NAME: { $like: `${searchWord}%`} }
            )
        }

        let dataDocument = await model.mst_document.findAndCountAll(search)
        if (dataDocument.rows.length > 0) {
            responseStatus.resOK(res, dataDocument)
        } else {
            responseStatus.resNotFound(res, "Data document Empty")
        }
    } catch (error) {
        next(error)
    }
}

controller.getOneMstDocMobile = async (req, res, next) => {
    let { id_document, doc_name } = req.query
    try {
        let dataOneDocument = await model.mst_document.findOne({
            where: {
                [Op.or]: [
                    { id_document: id_document },
                    { document_name: doc_name }
                ]
            }
        })

        if (dataOneDocument) {
            responseStatus.resOK(res, dataOneDocument)
        } else {
            responseStatus.resNotFound(res, "Data Document Not Found")
        }
    } catch (error) {
        next(error)
    }
}

controller.checkDocumentMobile = async (req, res, next) => {
    let { doc_name } = req.query
    try {
        let dataOneDocument = await model.mst_document.findOne({
            where: {
                document_name: doc_name
            }
        })

        if (dataOneDocument) {
            if (dataOneDocument.approval === true) {
                responseStatus.resOK(res, { approval: 1, msg: "OK" })
            } else {
                responseStatus.resOK(res, { approval: 0, msg: "Disable" })
            }
        } else {
            responseStatus.resNotFound(res, "Data Document Not Found")
        }
    } catch (error) {
        next(error)
    }
}

controller.getAllProcurementTypeMobile = async (req, res, next) => {
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

        if (limit != 0 || offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("type")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                // { ROLE_NAME: { $like: `${searchWord}%`} }
            )
        }
        let dataProcurementType = await model.mst_procurement_type.findAndCountAll(search);
        if (dataProcurementType.rows.length > 0) {
            responseStatus.resOK(res, dataProcurementType);
        } else {
            responseStatus.resNotFound(res, "Data Procurement type Empty")
        }
    } catch (err) {
        next(err)
    }
}

controller.getOneProcurementTypeMobile = async (req, res, next) => {
    let { id_procurement_type } = req.query
    try {
        let dataProcurementType = await model.mst_document.findOne({
            where: {
                [Op.or]: [
                    { id_procurement_type: id_procurement_type }
                ]
            }
        })

        if (dataProcurementType) {
            responseStatus.resOK(res, dataProcurementType)
        } else {
            responseStatus.resNotFound(res, "Data Procurement type Not Found")
        }
    } catch (err) {
        next(err)
    }
}

controller.getListLocationMobile = async (req, res, next) => {
    let { page, size, lang, searchWord } = req.body
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

        if (limit !== 0 && offset !== 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("location_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("province_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                // { ROLE_NAME: { $like: `${searchWord}%`} }
            )
        }
        let dataLocation = await model.v_location_province.findAndCountAll(search);
        if (dataLocation.rows.length > 0) {
            const provinceMap = new Map();

            dataLocation.rows.forEach((item) => {
                if (!provinceMap.has(item.province_name)) {
                    provinceMap.set(item.province_name, {
                        province_name: item.province_name,
                        id_province: item.id_province,
                        location: [],
                    });
                }

                provinceMap.get(item.province_name).location.push({
                    id_location: item.id_location,
                    location_name: item.location_name,
                });
            });

            const distinctData = [...provinceMap.values()];
            responseStatus.resOK(res, distinctData)
        } else {
            responseStatus.resNotFound(res, "Data Location Not Found")
        }
    } catch (err) {
        next(err)
    }
}

controller.getAllLocationCityMobile = async (req, res, next) => {
    let { page, size, lang, searchWord } = req.body
    try {
        let getPagination = (page, size) => {
            const limit = size ? +size : 0;
            const offset = page ? 0 + (page - 1) * limit : 0;
            return { limit, offset };
        };

        let limit = getPagination(page, size).limit;
        let offset = getPagination(page, size).offset;

        console.log("limit", limit)
        console.log("offset", offset)

        let search = {
            // limit,
            // offset,
            where: {
                // [Op.or]: [
                // ]
            },
            logging: console.log
        }

        if (limit !== 0 && offset !== 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("location_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            )
        }

        let location = await model.mst_location.findAndCountAll(search);

        if (!location || location.rows.length < 1) {
            throw new ErrorResponse("Data not found!", 404)
        }

        responseStatus.resOK(res, location)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.getAllKeywordMobile = async (req, res, next) => {
    let { page, size, lang, searchWord } = req.body
    try {
        let getPagination = (page, size) => {
            const limit = size ? +size : 0;
            const offset = page ? 0 + (page - 1) * limit : 0;
            return { limit, offset };
        };

        let limit = getPagination(page, size).limit;
        let offset = getPagination(page, size).offset;

        console.log("limit", limit)
        console.log("offset", offset)

        let search = {
            // limit,
            // offset,
            where: {
                // [Op.or]: [
                // ]
            },
            logging: console.log
        }

        if (limit !== 0 && offset !== 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("keyword")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            )
        }

        let keyword = await model.mst_keyword.findAndCountAll(search);

        if (!keyword || keyword.rows.length < 1) {
            throw new ErrorResponse("Data not found!", 404)
        }

        responseStatus.resOK(res, keyword)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.getAllSubdisMobile = async (req, res, next) => {
    let { page, size, lang, searchWord } = req.query
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

        if (limit != 0 || offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("sub_dis_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            )
        }

        let subdis = await model.mst_sub_dis.findAndCountAll(search);

        if (!subdis || subdis.rows.length < 1) {
            throw new ErrorResponse("Data not found!", 404)
        }

        responseStatus.resOK(res, subdis)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.getOneSubdisMobile = async (req, res, next) => {
    let { id_sub_dis } = req.query
    try {
        if (!id_sub_dis) {
            throw new ErrorResponse("Please insert id_sub_dis!", 400)
        }

        let subdis = await model.mst_sub_dis.findOne({
            where: { id_sub_dis: id_sub_dis }
        })

        if (!subdis) {
            throw new ErrorResponse("Data not found!", 400)
        }

        responseStatus.resOK(res, subdis)
    } catch (error) {
        next(error)
        console.log(error)
    }
}

controller.createSubdisMobile = async (req, res, next) => {
    let { sub_dis_name, id_location, id_coordinator } = req.body

    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });

    try {
        if (!sub_dis_name) {
            throw new ErrorResponse("Please insert sub_dis_name!", 400)
        }

        if (!id_location) {
            throw new ErrorResponse("Please insert id_location!", 400)
        }

        if (!id_coordinator) {
            throw new ErrorResponse("Please insert id_coordinator!", 400)
        }

        const procedureCall = "CALL insert_mst_sub_dis(:sub_dis_name, :id_location, :id_coordinator, :created_at, :created_by, :updated_at, :updated_by)";

        const parameter = {
            sub_dis_name: sub_dis_name ?? null,
            id_location: id_location ?? null,
            id_coordinator: id_coordinator ?? null,
            created_at: new Date(),
            created_by: req.username,
            updated_at: new Date(),
            updated_by: req.username,
            id_location: id_location ?? null
        }

        await db.query(procedureCall, {
            replacements: parameter,
            type: Sequelize.QueryTypes.RAW, // Use RAW query type for stored procedures
            transaction: t
        })

        await t.commit();
        console.log('Transaction committed successfully');

        return responseStatus.resOK(res, "Subdis created successfully")

        // .then((results) => {
        //     console.log('Procedure executed successfully:', results);
        //     return responseStatus.resCreated(res, parameter)
        // })
        // .catch((error) => {
        //     console.error('Error executing procedure:', error);
        //     return ErrorResponse(error, 400)
        // });
    } catch (error) {
        if (t) {
            await t.rollback();
            console.log('Transaction rolled back');
        }
        console.log(error);
        next(error)
    }
}

controller.editSubdisMobile = async (req, res, next) => {
    let { id_sub_dis, sub_dis_name, id_location, id_coordinator } = req.body
    try {
        if (!id_sub_dis) {
            throw new ErrorResponse("Please insert id_sub_dis", 400)
        }

        const functionCall = "SELECT update_mst_sub_dis(:id_sub_dis, :sub_dis_name, :id_location, :id_coordinator, :updated_at, :updated_by)";

        const parameter = {
            id_sub_dis: id_sub_dis,
            sub_dis_name: sub_dis_name ?? null,
            id_location: id_location ?? null,
            id_coordinator: id_coordinator ?? null,
            updated_at: new Date(),
            updated_by: req.username,
        }

        db.query(functionCall, {
            replacements: parameter,
            type: Sequelize.QueryTypes.SELECT, // Use SELECT for function calls
        })
            .then((results) => {
                console.log('Function executed successfully:', results);
                return responseStatus.resCreated(res, results[0].update_mst_sub_dis);
            })
            .catch((error) => {
                console.error('Error executing function:', error);
                throw new ErrorResponse(error, 400)
            });
    } catch (error) {
        console.log(error)
        next(error)
        throw new ErrorResponse(error, 400)
    }
}

controller.deleteSubdisMobile = async (req, res, next) => {
    let { id_sub_dis } = req.body
    let t = await db.transaction({
        autoCommit: false,
        autoCommitTransactionalOFF: true,
    });

    try {
        let findSubdis = await model.mst_sub_dis.findOne({
            where: {
                id_sub_dis: { [Op.in]: id_sub_dis }
            }, transaction: t
        })

        if (!findSubdis) {
            throw new ErrorResponse("Subdis not found", 404)
        }

        let deleteSubdis = await model.mst_sub_dis.destroy({
            where: { id_sub_dis: { [Op.in]: id_sub_dis } },
            transaction: t
        })

        await t.commit()

        return responseStatus.resOK(res, "Subdis deleted successfully")
    } catch (error) {
        console.log(error)
        if (t && !t.finished) await t.rollback();
        next(error)
    }
}

controller.getAllStatusMobile = async (req, res, next) => {
    let { page, size, lang, searchWord } = req.query
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

        if (limit != 0 || offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("value")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            )
        }

        console.log("search", JSON.stringify(search))

        let status = await model.mst_status.findAndCountAll(search);

        if (!status || status.rows.length < 1) {
            throw new ErrorResponse("Data not found!", 404)
        }

        responseStatus.resOK(res, status)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

// position

controller.getAllPosition = async (req, res, next) => {
    let { page, size, lang, searchWord } = req.query
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

        if (limit !== 0 || offset !== 0) {
            search.limit = limit
            search.offset = offset
        }

        if (searchWord) {
            search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("position")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            )
        }

        let position = await model.mst_position.findAndCountAll(search);

        if (!position || position.rows.length < 1) {
            throw new ErrorResponse("Data not found!", 404)
        }

        responseStatus.resOK(res, position)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.getOnePosition = async (req, res, next) => {
    let { id } = req.query
    try {
        if (!id) {
            throw new ErrorResponse("Please insert id_position!", 400)
        }

        let position = await model.mst_position.findOne({
            where: { id_position: id }
        })

        if (!position) {
            throw new ErrorResponse("Data not found!", 400)
        }

        responseStatus.resOK(res, position)
    } catch (error) {
        next(error)
        console.log(error)
    }
}

controller.getTemplate = async (req, res, next) => {
    const relativePath = '../../template/template.xlsx';

    // Path absolut ke file Excel
    const data = path.join(__dirname, relativePath);
    res.download(data)
    //responseStatus.resOK(res, data)
}

// Notification

controller.readAtHistoryNotif = async (req, res, next) => {
    let { id } = req.query
    try {
        let findDataNotif = await model.history_notification.findAll({
            where: {
                id_notification: id
            }
        })
        if (findDataNotif) {
            let updateNotif = await model.history_notification.update({
                read_at: new Date()
            }, {
                where: {
                    id_notification: id
                }
            })
            responseStatus.resCreated(res, updateNotif)
        } else {
            responseStatus.resNotFound(res, "Data not found")
        }
    } catch (error) {
        next(error)
    }
}

controller.getDataNotification = async (req, res, next) => {
    try {
        let findDataNotif = await model.history_notification.findAll({
            where: {
                receiver: `${req.id_profile}`
            }
        })
        if (findDataNotif.length > 0) {
            findDataNotif.map((x) => {
                if (x.read_at) {
                    x.dataValues.readStatus = true
                } else {
                    x.dataValues.readStatus = false
                }
            })
            responseStatus.resOK(res, findDataNotif)
        } else {
            responseStatus.resNotFound(res, "No Data Found")
        }
    } catch (error) {
        next(error)
    }
}

controller.getOneDataNotification = async (req, res, next) => {
    let { id } = req.query
    try {
        let findDataNotif = await model.history_notification.findAll({
            where: {
                id_notification: id
            }
        })
        if (findDataNotif) {
            responseStatus.resOK(res, findDataNotif)
        } else {
            responseStatus.resNotFound(res, "Data not found")
        }
    } catch (error) {
        next(error)
    }
}

controller.readAtHistoryNotifMobile = async (req, res, next) => {
    let { id } = req.query
    try {
        let findDataNotif = await model.history_notification.findAll({
            where: {
                id_notification: id
            }
        })
        if (findDataNotif) {
            let updateNotif = await model.history_notification.update({
                read_at: new Date()
            }, {
                where: {
                    id_notification: id
                }
            })
            responseStatus.resCreated(res, updateNotif)
        } else {
            responseStatus.resNotFound(res, "Data not found")
        }
    } catch (error) {
        next(error)
    }
}

controller.getDataNotificationMobile = async (req, res, next) => {
    try {
        let findDataNotif = await model.history_notification.findAll({
            where: {
                receiver: `${req.id_profile}`
            }
        })
        if (findDataNotif.length > 0) {
            findDataNotif.map((x) => {
                if (x.read_at) {
                    x.dataValues.readStatus = true
                } else {
                    x.dataValues.readStatus = false
                }
            })
            responseStatus.resOK(res, findDataNotif)
        } else {
            responseStatus.resNotFound(res, "No Data Found")
        }
    } catch (error) {
        next(error)
    }
}

controller.getOneDataNotificationMobile = async (req, res, next) => {
    let { id } = req.query
    try {
        let findDataNotif = await model.history_notification.findAll({
            where: {
                id_notification: id
            }
        })
        if (findDataNotif) {
            responseStatus.resOK(res, findDataNotif)
        } else {
            responseStatus.resNotFound(res, "Data not found")
        }
    } catch (error) {
        next(error)
    }
}


module.exports = controller;