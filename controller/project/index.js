const path = require("path");
const asynco = require("async");
const axios = require("axios").default;
const Sequelize = require("sequelize");
const { Op, QueryTypes } = require("sequelize");

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
const formatDate = require("../../utils/formatDate");
const padLeft = require("../../utils/padLeft");
const { Console } = require("console");
const { getReceiverToApprove, addToTableHistoryNotif, payloadToNotif, getReceiver } = require("../../utils/notification");
const pushNotif = require("../../utils/pushNotification");
const moment = require("moment")

const controller = {}

async function addToHistory(data) {
    try {
        let inputdataHistory = await model.detail_file_project_history.bulkCreate(data);
        return inputdataHistory;
    } catch (err) {
        return err
    }
}
async function copyToHistoryProjectCode(data, username) {
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    try {
        let findData = await model.detail_file_project.findAll({
            where: {
                project_code: { [Op.in]: data }
            }
        })
        console.log("masuk")
        if (findData.length > 0) {
            console.log("masuk sini")
            let dataTemp = [];
            let idData = [];
            for (let i = 0; i < findData.length; i++) {
                let dataProject = {
                    id_marketing: findData[i].id_marketing,
                    project_code: findData[i].project_code,
                    project_data_source: findData[i].project_data_source,
                    status_approval: findData[i].project_data_source,
                    approved_by: findData[i].approved_by,
                    approved_date: findData[i].approved_date,
                    id_keyword: findData[i].id_keyword,
                    input_date: findData[i].input_date,
                    package: findData[i].package,
                    pagu: findData[i].page,
                    id_procurement_type: findData[i].id_procurement_type,
                    //id_header_project: Sequelize.NUMBER,
                    method: findData[i].method,
                    choose_date: findData[i].choose_date,
                    klpd: findData[i].klpd,
                    work_unit: findData[i].work_unit,
                    id_location: findData[i].id_location,
                    fund_source: findData[i].fund_source,
                    created_at: findData[i].created_at,
                    created_by: findData[i].created_by,
                    updated_at: new Date(),
                    updated_by: username,
                    filename: findData[i].filename,
                    url: findData[i].url,
                    coordinator: findData[i].coordinator,
                    company: findData[i].company,
                    source_document: findData[i].source_document,
                    contract_value: findData[i].contract_value
                }
                idData.push(findData[i].project_code)
                dataTemp.push(dataProject);
            }
            console.log(dataTemp)
            console.log(idData)
            let inputdataHistory = await model.detail_file_project_history.bulkCreate(dataTemp, { transaction: t });
            let deleteData = await model.detail_file_project.destroy({
                where: {
                    project_code: {
                        [Op.in]: idData
                    }
                },
                transaction: t
            })
        }
        await t.commit;
        return true;
    } catch (error) {
        console.log(error)
        if (t && !t.finished) await t.rollback();
        return error
    }
}
// async function copyToHistoryProjectCodeSirup(data, username) {
//     const t = await db.transaction({
//         autoCommitTransactionalOFF: true,
//     });
//     try {
//         let findData = await model.detail_file_project.findAll({
//             where: {
//                 project_code: { [Op.in]: data }
//             }
//         })
//         console.log("masuk")
//         if (findData.length > 0) {
//             console.log("masuk sini")
//             let dataTemp = [];
//             let idData = [];
//             for (let i = 0; i < findData.length; i++) {
//                 let dataProject = {
//                     id_marketing: findData[i].id_marketing,
//                     project_code: findData[i].project_code,
//                     project_data_source: findData[i].project_data_source,
//                     status_approval: findData[i].project_data_source,
//                     approved_by: findData[i].approved_by,
//                     approved_date: findData[i].approved_date,
//                     id_keyword: findData[i].id_keyword,
//                     input_date: findData[i].input_date,
//                     package: findData[i].package,
//                     pagu: findData[i].page,
//                     id_procurement_type: findData[i].id_procurement_type,
//                     //id_header_project: Sequelize.NUMBER,
//                     method: findData[i].method,
//                     choose_date: findData[i].choose_date,
//                     klpd: findData[i].klpd,
//                     work_unit: findData[i].work_unit,
//                     id_location: findData[i].id_location,
//                     fund_source: findData[i].fund_source,
//                     created_at: findData[i].created_at,
//                     created_by: findData[i].created_by,
//                     updated_at: new Date(),
//                     updated_by: username,
//                     filename: findData[i].filename,
//                     url: findData[i].url,
//                     coordinator: findData[i].coordinator,
//                     company: findData[i].company,
//                     source_document: findData[i].source_document,
//                     contract_value: findData[i].contract_value
//                 }
//                 idData.push(findData[i].project_code)
//                 dataTemp.push(dataProject);
//             }
//             console.log(dataTemp)
//             console.log(idData)
//             let inputdataHistory = await model.detail_file_project_history.bulkCreate(dataTemp, { transaction: t });
//             let deleteData = await model.detail_file_project.destroy({
//                 where: {
//                     project_code: {
//                         [Op.in]: idData
//                     }
//                 },
//                 transaction: t
//             })
//         }
//         await t.commit;
//         return true;
//     } catch (error) {
//         console.log(error)
//         if (t && !t.finished) await t.rollback();
//         return error
//     }
// }
async function copyToHistory(data) {
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    try {
        let findData = await model.detail_file_project.findAll({
            where: {
                id_detail_file_project: { [Op.in]: data }
            }
        })
        console.log("masuk")
        if (findData.length > 0) {
            console.log("masuk sini")
            let dataTemp = [];
            let idData = [];
            for (let i = 0; i < findData.length; i++) {
                let dataProject = {
                    id_marketing: findData[i].id_marketing,
                    project_code: findData[i].project_code,
                    project_data_source: findData[i].project_data_source,
                    status_approval: findData[i].project_data_source,
                    approved_by: findData[i].approved_by,
                    approved_date: findData[i].approved_date,
                    id_keyword: findData[i].id_keyword,
                    input_date: findData[i].input_date,
                    package: findData[i].package,
                    pagu: findData[i].page,
                    id_procurement_type: findData[i].id_procurement_type,
                    //id_header_project: Sequelize.NUMBER,
                    method: findData[i].method,
                    choose_date: findData[i].choose_date,
                    klpd: findData[i].klpd,
                    work_unit: findData[i].work_unit,
                    id_location: findData[i].id_location,
                    fund_source: findData[i].fund_source,
                    created_at: findData[i].created_at,
                    created_by: findData[i].created_by,
                    updated_at: new Date(),
                    updated_by: req.username,
                    filename: findData[i].filename,
                    url: findData[i].url,
                    coordinator: findData[i].coordinator,
                    company: findData[i].company,
                    source_document: findData[i].source_document,
                    contract_value: findData[i].contract_value
                }
                idData.push(findData[i].id_detail_file_project)
                dataTemp.push(dataProject);
            }
            let inputdataHistory = await model.detail_file_project_history.bulkCreate(dataTemp, { transaction: t });
            let deleteData = await model.detail_file_project.destroy({
                where: {
                    id_detail_file_project: { [Op.in]: idData }
                }, transaction: t
            })
        }
        await t.commit;
        return true;
    } catch (error) {
        console.log(error)
        if (t && !t.finished) await t.rollback();
        return error
    }
}
async function emitToSocket(data) {
    let pengirimSocket = socketApi.io.sockets.sockets[data.pengirimUserId];
    let result = ''
    data.penerima.forEach((penerimaUserId) => {
        let penerimaSocket = socketApi.io.sockets.sockets[penerimaUserId];

        if (penerimaSocket) {
            // Kirim pesan hanya kepada pengguna penerima dalam ruang yang sesuai
            let message = data.msg
            const roomName = `user_${penerimaUserId}`;
            penerimaSocket.emit('pesan', { pengirim: pengirimSocket, message });
            result = `pesan telah dikirimkan kepada user : ${penerimaUserId}`
        } else {
            result = `pesan gagal dikirimkan kepada user : ${penerimaUserId}`
        }
    });
    return result
}
async function findDataUserToNotif(data) {

}
async function updateByEmployee(data) {

}
async function generateProjectCode(data) {
    // data = 'PAVIROMMYY'
    let result
    let number

    let dataFind = await model.v_all_project.findOne({
        where: {
            project_code: { [Op.like]: data }
        },
        order: [["project_code", "DESC"]]
    })

    if (dataFind) {
        console.log(findPort, '----')
        let code = dataFind.project_code
        code = code.substring(code.length - 4, code.length + 1)
        number = +code + 1
        let editedNumber = padLeft(number, 4)
        opCod = `${data}${editedNumber}`
    } else {
        result = `${data}0001`
    }

    let valNumber = 1
    let checkDataProjectCode = await model.v_all_project.findOne({
        where: {
            project_code: result
        }
    })
    if (checkDataProjectCode) {
        for (let i = valNumber; i < valNumber + 1; i++) {
            let newNumber = number + i
            let newCode = `${data}${padLeft(newNumber, 4)}`
            let checkCode = await model.v_all_project.findOne({
                where: {
                    project_code: newCode
                }
            })
            if (!checkCode) {
                valNumber = 0
                result = newCode
            } else {
                valNumber = valNumber + 1
            }
        }
    }

    return result;
}
async function findDataProject(project_code) {
    let data = await model.v_all_project.findOne({
        where: {
            project_code: project_code
        }
    })
    return data;
}

async function addToHistoryProject(data) {
    let dataInput = {
        id_marketing: data.id_marketing,
        project_code: data.project_code,
        project_data_source: data.project_data_source,
        status_approval: data.status_approval,
        approved_by: data.approved_by,
        approved_date: data.approval_date,
        id_keyword: data.id_keyword,
        input_date: data.input_date,
        package: data.package,
        pagu: data.pagu,
        id_procurement_type: data.id_procurement_type,
        method: data.method,
        choose_date: data.choose_date,
        klpd: data.klpd,
        work_unit: data.work_unit,
        id_location: data.id_location,
        fund_source: data.fund_source,
        created_at: new Date(),
        created_by: req.username,
        updated_at: new Date(),
        updated_by: req.username,
        filename: data.filename,
        sub_dis: data.data[j]?.sub_dis,
        url: data.url,
        unit_value: data.unit_value,
        type_item: data.type_item,
        unit_set: data.unit_set,
        coordinator: data.coordinator,
        company: data.company,
        source_document: data.source_document,
        contract_value: data.contract_value,
    }

    let addDataToHistory = await model.detail_file_project_history.create(dataInput);
    return addDataToHistory;
}
// async function findDataProjectTemp(data) {
//     try {
//         const result = await model.detail_file_project_temp.findAll({
//             where: {
//                 project_code: { [Op.in]: data } // project code
//             }
//         });
//         return result;
//     } catch (error) {
//         return error
//     }
// }

controller.findDataProjectTempPC = async (req, res, next) => {
    let data = req.body
    try {
        if (data) {
            data = data = typeof data == "string" ? JSON.parse(data) : data
            const result = await model.detail_file_project_temp.findAll({
                where: {
                    project_code: { [Op.in]: data } // project code
                }
            });
            responseStatus.resOK(res, result)
        } else {
            responseStatus.resBadRequest(res, "Input is Empty")
        }
    } catch (error) {
        next(error)
    }
}

controller.addProjectToTempBulk = async (req, res, next) => {
    let data = req.body
    try {
        if (data) {
            data = data = typeof data == "string" ? JSON.parse(data) : data

            if (data.length > 0) {

                // for (let i = 0; i < data.length; i++) {
                //     if (data[i].source_document != "Sirup" && data[i].project_code == null) {
                //         data[i].source_document = "Non-Sirup"

                //         let date = new Date();
                //         let month = (date.getMonth() + 1).toString().padStart(2, '0');
                //         let year = date.getFullYear().toString().slice(-2);
                //         let MMYY = month + year;

                //         let projectCode = await generateProjectCode(`P${data.company}${MMYY}`)
                //         data[i].project_code = projectCode
                //     }
                // }
                let result = await model.detail_file_project_temp.bulkCreate(data);
                responseStatus.resCreated(res, result)
            } else {
                responseStatus.resBadRequest(res, "Input is Empty")
            }

        } else {
            responseStatus.resBadRequest(res, "Input is Empty")
        }
    } catch (error) {
        return error;
    }
}

controller.addProjectToActualBulk = async (req, res, next) => {
    let data = req.body
    console.log(data)
    try {
        if (data) {
            data = data = typeof data == "string" ? JSON.parse(data) : data
            if (data.length > 0) {
                // for (let i = 0; i < data.length; i++) {
                //     if (data[i].source_document != "Sirup" && data[i].project_code == null) {
                //         data[i].source_document = "Non-Sirup"

                //         let date = new Date();
                //         let month = (date.getMonth() + 1).toString().padStart(2, '0');
                //         let year = date.getFullYear().toString().slice(-2);
                //         let MMYY = month + year;

                //         let projectCode = await generateProjectCode(`P${data.company}${MMYY}`)
                //         data[i].project_code = projectCode
                //     }
                // }
                for (let i = 0; i < data.length; i++) {
                    data[i].contract_value = data[i].contract_value ? data[i].contract_value : data[i].pagu
                }
                let result = await model.detail_file_project.bulkCreate(data);
                //console.log(result)
                responseStatus.resCreated(res, result)
            } else {
                responseStatus.resBadRequest(res, "Input is Empty")
            }
        } else {
            responseStatus.resBadRequest(res, "Input is Empty")
        }
    } catch (error) {
        console.log(error)
        return error;
    }
}

controller.addToHistoryProjectBulk = async (req, res, next) => {
    let data = req.body
    try {
        if (data) {
            data = data = typeof data == "string" ? JSON.parse(data) : data
            let result = await model.detail_file_project_history.bulkCreate(data)
            responseStatus.resCreated(res, result)
        } else {
            responseStatus.resBadRequest(res, "Input is Empty")
        }
    } catch (error) {
        next(error)
    }
}

controller.addProgressBulk = async (req, res, next) => {
    let data = req.body
    try {
        if (data) {
            data = data = typeof data == "string" ? JSON.parse(data) : data
            let result = await model.status_project.bulkCreate(data);
            responseStatus.resCreated(res, result)
        } else {
            responseStatus.resBadRequest(res, "Input is Empty")
        }
    } catch (error) {
        next(error)
    }
}

controller.addProgressBulkTemp = async (req, res, next) => {
    let data = req.body
    try {
        if (data) {
            data = data = typeof data == "string" ? JSON.parse(data) : data
            let result = await model.status_project_temp.bulkCreate(data);
            responseStatus.resCreated(res, result)
        } else {
            responseStatus.resBadRequest(res, "Input is Empty")
        }
    } catch (error) {
        next(error)
    }
}

//controller.findDataStatus = async

// controller.deleteProjectTemp = async (req, res, next) => {
//     let { data } = req.body
//     try {
//         if (data) {
//             data = data = typeof data == "string" ? JSON.parse(data) : data
//             let result = await model.detail_file_project_temp.destroy({
//                 where: {
//                     id_detail_file_project_temp: { [Op.in]: data }
//                 }
//             })
//             responseStatus.resOK(res, result)
//         } else {
//             responseStatus.resBadRequest(res, "Input is Empty")
//         }
//     } catch (error) {
//         return error;
//     }
// }

controller.createProject = async (req, res, next) => {
    let { data } = req.body
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    /* 
    data = {
        project_code = [],
        data = [
            {
                    id_marketing: 1,
                    project_code: 234,
                    project_data_source: "jhgghg",
                    status_approval: null,
                    approved_by: "system",
                    approved_date: new Date(),
                    id_keyword: findData[i].id_keyword,
                    input_date: findData[i].input_date,
                    package: findData[i].package,
                    pagu: findData[i].page,
                    id_procurement_type: findData[i].id_procurement_type,
                    //id_header_project: Sequelize.NUMBER,
                    method: findData[i].method,
                    choose_date: findData[i].choose_date,
                    klpd: findData[i].klpd,
                    work_unit: findData[i].work_unit,
                    id_location: findData[i].id_location,
                    fund_source: findData[i].fund_source,
                    created_at: findData[i].created_at,
                    created_by: findData[i].created_by,
                    updated_at: new Date(),
                    updated_by: req.username,
                    filename : findData[i].filename,
                    id_sub_dis: findData[i].id_sub_dis,
                    url: ,
                    unit_value: ,
                    type_item : ,
                    unit_set : ,
                    coordinator: ,
                    company: ,
                    source_document: ,
                }
        ]
    }
    */

    try {
        if (data) {
            data = typeof data == "string" ? JSON.parse(data) : data
            let checkDocument = await model.mst_document.findOne({
                where: {
                    document_name: "project" // harus diinput dulu di master
                }
            })
            let result
            if (data.data.length > 0) {
                if (checkDocument) {
                    let dataInputProgress = []
                    let allData = []
                    for (let j = 0; j < data.data.length; j++) {
                        let dataInput = {
                            id_marketing: data.data[j].id_marketing,
                            project_code: data.data[j].project_code,
                            project_data_source: data.data[j].project_data_source,
                            status_approval: checkDocument.approval === true ? null : "approved",
                            approved_by: checkDocument.approval === true ? null : "system",
                            approved_date: checkDocument.approval === true ? null : new Date(),
                            id_keyword: data.data[j].id_keyword,
                            input_date: data.data[j].input_date,
                            package: data.data[j].package,
                            pagu: data.data[j].pagu,
                            id_procurement_type: data.data[j].id_procurement_type,
                            method: data.data[j].method,
                            choose_date: data.data[j].choose_date,
                            klpd: data.data[j].klpd,
                            work_unit: data.data[j].work_unit,
                            id_location: data.data[j].id_location,
                            fund_source: data.data[j].fund_source,
                            created_at: new Date(),
                            created_by: req.username,
                            updated_at: new Date(),
                            updated_by: req.username,
                            filename: data.data[j].filename,
                            //id_sub_dis: data.data[j]?.id_sub_dis,
                            sub_dis: data.data[j].sub_dis,
                            url: data.data[j].url,
                            unit_value: data.data[j].unit_value,
                            type_item: data.data[j].type_item,
                            unit_set: data.data[j].unit_set,
                            coordinator: data.data[j].coordinator,
                            company: data.data[j].company,
                            source_document: data.data[j].source_document,
                            contract_value: data.data[j].contract_value,
                        }

                        if (checkDocument.approval === true) {
                            dataInput.id_progress = data.data[j].id_progress
                        }
                        allData.push(dataInput)
                    }
                    if (checkDocument.approval === true) { // maka cek temp dan masuk ke temp
                        let findDataTemp = await model.detail_file_project_temp.findAll({
                            where: {
                                project_code: { [Op.in]: data.project_code }
                            }
                        })
                        let createDataToTemp = await model.detail_file_project_temp.bulkCreate(allData, { transaction: t })
                        if (findDataTemp.length > 0) {
                            const idsToDelete = findDataTemp.map(item => item.id);
                            let deleteDataTemp = await model.detail_file_project_temp.destroy({
                                where: {
                                    id_detail_file_project_temp: { [Op.in]: idsToDelete }
                                }, transaction: t
                            })
                        }
                        result = createDataToTemp;
                    } else { // langsung check dan masuk ke actual data lama input ke history
                        let copied = await copyToHistoryProjectCode(data.project_code)
                        if (copied === true) {
                            let createDataToActual = await model.detail_file_project.bulkCreate(allData, { transaction: t })

                            let dataAddFixHistory = allData.map((item) => ({
                                ...item,
                                description: "approved automatically"
                            }));
                            let createToHistory = await model.detail_file_project_history.bulkCreate(dataAddFixHistory, { transaction: t })
                            result = createDataToActual;
                        } else {
                            throw new ErrorResponse("Failed To Copy or Delete", 400)
                        }
                    }
                    await t.commit()
                    responseStatus.resCreated(res, result);
                } else {
                    responseStatus.resNotAcceptable(res, "Document transaction not found, please insert document first")
                }
            } else {
                responseStatus.resBadRequest(res, "Input data is empty")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        next(error)
    }
}
controller.createProjects = async (req, res, next) => {
    console.log("masuk ???")
    let { data } = req.body
    /* 
    data = {
        project_code = [],
        data = [
            {
                    id_marketing: 1,
                    project_code: 234,
                    project_data_source: "jhgghg",
                    status_approval: null,
                    approved_by: "system",
                    approved_date: new Date(),
                    id_keyword: findData[i].id_keyword,
                    input_date: findData[i].input_date,
                    package: findData[i].package,
                    pagu: findData[i].page,
                    id_procurement_type: findData[i].id_procurement_type,
                    //id_header_project: Sequelize.NUMBER,
                    method: findData[i].method,
                    choose_date: findData[i].choose_date,
                    klpd: findData[i].klpd,
                    work_unit: findData[i].work_unit,
                    id_location: findData[i].id_location,
                    fund_source: findData[i].fund_source,
                    created_at: findData[i].created_at,
                    created_by: findData[i].created_by,
                    updated_at: new Date(),
                    updated_by: req.username,
                    filename : findData[i].filename,
                    //id_sub_dis: findData[i].id_sub_dis,
                    sub_dis: "",                    
                    url: ,
                    unit_value: ,
                    type_item : ,
                    unit_set : ,
                    coordinator: ,
                    company: ,
                    source_document: ,
                }
        ]
    }
    */
    try {
        if (data) {
            data = typeof data == "string" ? JSON.parse(data) : data
            let checkDocument = await model.mst_document.findOne({
                where: {
                    document_name: "project" // harus diinput dulu di master
                }
            })
            // let dataCoordinator = []
            // let dataMarketing = []

            let dataReceiver = []
            //checkDocument.approval = false;
            let result
            if (data.data.length > 0) {
                if (checkDocument) {
                    let dataInputProgress = []
                    let allData = []
                    for (let j = 0; j < data.data.length; j++) {
                        let dataTempReceiver = []
                        let dataInput = {
                            id_marketing: data.data[j].id_marketing,
                            project_code: data.data[j].project_code,
                            project_data_source: data.data[j].project_data_source,
                            status_approval: checkDocument.approval === true ? null : "approved",
                            approved_by: checkDocument.approval === true ? null : "system",
                            approved_date: checkDocument.approval === true ? null : new Date(),
                            id_keyword: data.data[j].id_keyword,
                            input_date: data.data[j].input_date,
                            package: data.data[j].package,
                            pagu: data.data[j].pagu,
                            id_procurement_type: data.data[j].id_procurement_type,
                            method: data.data[j].method,
                            choose_date: data.data[j].choose_date,
                            klpd: data.data[j].klpd,
                            work_unit: data.data[j].work_unit,
                            id_location: data.data[j].id_location,
                            fund_source: data.data[j].fund_source,
                            created_at: new Date(),
                            created_by: req.username,
                            updated_at: new Date(),
                            updated_by: req.username,
                            filename: data.data[j].filename,
                            sub_dis: data.data[j]?.sub_dis,
                            url: data.data[j].url,
                            unit_value: data.data[j].unit_value,
                            type_item: data.data[j].type_item,
                            unit_set: data.data[j].unit_set,
                            coordinator: data.data[j].coordinator,
                            company: data.data[j].company,
                            source_document: data.data[j].source_document,
                            contract_value: data.data[j].contract_value,
                        }

                        // dataCoordinator.push({ receiver: data.data[j].coordinator, project_code: data.data[j].project_code })

                        // dataMarketing.push({ receiver: data.data[j].id_marketing, project_code: data.data[j].project_code })
                        if (data.data[j].id_marketing != null) {
                            dataTempReceiver.push(data.data[j].id_marketing)
                        }
                        if (data.data[j].coordinator != null) {
                            dataTempReceiver.push(data.data[j].coordinator)
                        }

                        // if (data.data[j].id_sub_dis != null) {
                        //     dataTempReceiver.push(data.data[j].id_sub_dis)
                        // }

                        // data.data[j].id_marketing ?? dataTempReceiver.push(data.data[j].id_marketing)
                        // data.data[j].coordinator ?? dataTempReceiver.push(data.data[j].coordinator )
                        // data.data[j].id_sub_dis ?? dataTempReceiver.push(data.data[j].id_sub_dis)

                        if (checkDocument.approval === true) {
                            dataInput.id_progress = data.data[j].id_progress
                        } else {
                            let findDataStatus = await model.mst_status.findOne({
                                where: {
                                    id_status: data.data[j].id_progress
                                }
                            })
                            if (findDataStatus) {
                                dataInputProgress.push({
                                    value: findDataStatus.value,
                                    id_status: data.data[j].id_progress,
                                    project_code: data.data[j].project_code
                                })
                            }
                        }
                        allData.push(dataInput)
                        console.log(dataTempReceiver, "---------===")
                        if (dataTempReceiver.length > 0) {
                            let dataReceiverFind = await getReceiver({
                                receiver: dataTempReceiver,
                                parent: 'Master Project',
                                header: data.data[j].project_code,
                                credential: data.data[j].package // judul
                            })
                            console.log(dataReceiverFind, '++++')
                            if (dataReceiverFind.length > 0) {
                                dataReceiver = dataReceiver.concat(dataReceiverFind)
                            }
                            // dataReceiverFind.length > 0 ?? dataReceiver.concat(dataReceiverFind)
                        }
                    }

                    if (checkDocument.approval === true) { // maka cek temp dan masuk ke temp
                        let config = {
                            headers: { authorization: `Bearer ${req.token}` }
                        };

                        let findDataTemp
                        if (data.project_code.length > 0) {
                            findDataTemp = await axios.post(
                                "http://localhost:8033/get-project-temp-pc",
                                data.project_code,
                                config
                            );
                        }



                        console.log(findDataTemp, "========")

                        let createDataToTemp = await axios.post(
                            "http://localhost:8033/add-project-temp-api",
                            allData,
                            config
                        )

                        if (findDataTemp && findDataTemp?.data?.responseResult.length > 0 && createDataToTemp?.data?.code == 1) {
                            // console.log("masuk sini")
                            // console.log(findDataTemp)
                            const idsToDelete = findDataTemp.data?.responseResult.map(item => item.id_detail_file_project_temp);
                            let dataId = JSON.stringify(idsToDelete)
                            console.log(dataId, "====___")
                            let deleteDataTemp = await axios.delete(
                                `http://localhost:8033/delete-project-temp-api?id=${dataId}`,
                                config
                            )
                            console.log(deleteDataTemp, '+++')
                        }

                        result = createDataToTemp?.data?.responseResult;
                    } else { // langsung check dan masuk ke actual data lama input ke history
                        let config = {
                            headers: { authorization: `Bearer ${req.token}` }
                        };

                        let copied = await copyToHistoryProjectCode(data.project_code, req.username)

                        if (copied === true) {
                            let createDataToActual = await axios.post(
                                "http://localhost:8033/add-project-act-api",
                                allData,
                                config
                            )
                            //console.log("createdata", createDataToActual)
                            //let createDataToActual = await model.detail_file_project.bulkCreate(allData, { transaction: t })
                            let dataAddStatusProgress = []
                            if (createDataToActual?.data?.code == 1) {
                                console.log("masuk sini");
                                createDataToActual?.data?.responseResult.forEach(item1 => {
                                    //console.log(item1, "=======")
                                    dataInputProgress.forEach(item2 => {
                                        if (item1.project_code === item2.project_code) {
                                            dataAddStatusProgress.push({
                                                id_project: item1.id_detail_file_project,
                                                id_status: item2.id_status,
                                                description: "upload automaticlly",
                                                created_at: new Date(),
                                                created_by: req.username,
                                                updated_at: new Date(),
                                                updated_by: req.username,
                                                value: item2.value
                                            })
                                        }
                                    });
                                });

                                let uploadProgress = await axios.post(
                                    "http://localhost:8033/add-progress-actual-api",
                                    dataAddStatusProgress,
                                    config
                                )
                                let dataAddFixHistory = allData.map((item) => ({
                                    ...item,
                                    description: "approved automatically"
                                }));

                                let createToHistory = await axios.post(
                                    "http://localhost:8033/add-project-history-api",
                                    dataAddFixHistory,
                                    config
                                )
                                result = createDataToActual?.data?.responseResult;
                            }
                        } else {
                            throw new ErrorResponse("Failed To Copy or Delete", 400)
                        }
                    }

                    if (dataReceiver.length > 0) {
                        console.log("masuk sini!!!")
                        for (let i = 0; i < dataReceiver.length; i++) {
                            let dataNotif = await payloadToNotif(dataReceiver[i].header, dataReceiver[i].credential, dataReceiver[i].receiver, req.id_profile, `http://localhost:3000/master/project?project_code=${dataReceiver[i].header}`)
                            let addToNotif = await addToTableHistoryNotif(dataNotif);
                            console.log(addToNotif, '+++++++++')
                            let pushNotifData = await pushNotif(dataNotif);
                            console.log(pushNotifData, "------------")
                        }
                    }
                    responseStatus.resCreated(res, result);
                } else {
                    responseStatus.resNotAcceptable(res, "Document transaction not found, please insert document first")
                }
            } else {
                responseStatus.resBadRequest(res, "Input data is empty")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.deleteProjectTemp = async (req, res, next) => {
    let { id } = req.query
    try {
        if (id) {
            id = typeof id == "string" ? JSON.parse(id) : id
            let result
            console.log(id, "----------------------")
            if (id.length > 0) {
                let deleteDataTemp = await model.detail_file_project_temp.destroy({
                    where: {
                        id_detail_file_project_temp: { [Op.in]: id }
                    }
                })
                result = deleteDataTemp;
                responseStatus.resCreated(res, result);
            } else {
                responseStatus.resCreated(res, "Ok");
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        //if (t && !t.finished) await t.rollback();
        next(error)
    }
}
controller.deleteProjectActual = async (req, res, next) => {
    let { id } = req.query
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    try {
        if (id) {
            id = typeof id == "string" ? JSON.parse(id) : id
            if (id.length > 0) {
                let findData = await model.detail_file_project.findAll({
                    where: {
                        id_detail_file_project: { [Op.in]: id }
                    }
                })
                if (findData.length > 0) {
                    let dataTemp = [];
                    //let idData = [];
                    for (let i = 0; i < findData.length; i++) {
                        let dataProject = {
                            id_marketing: findData[i].id_marketing,
                            project_code: findData[i].project_code,
                            project_data_source: findData[i].project_data_source,
                            status_approval: findData[i].project_data_source,
                            approved_by: findData[i].approved_by,
                            approved_date: findData[i].approved_date,
                            id_keyword: findData[i].id_keyword,
                            input_date: findData[i].input_date,
                            package: findData[i].package,
                            url: findData[i].url,
                            pagu: findData[i].page,
                            id_procurement_type: findData[i].id_procurement_type,
                            //id_header_project: Sequelize.NUMBER,
                            created_at: findData[i].created_at,
                            created_by: findData[i].created_by,
                            updated_at: new Date(),
                            updated_by: req.username,
                            filename: findData[i].filename,
                            //id_sub_dis: findData[i].id_sub_dis,
                            sub_dis: findData[i].sub_dis,
                            url: findData[i].url,
                            unit_value: findData[i].unit_value,
                            type_item: findData[i].type_item,
                            unit_set: findData[i].unit_set,
                            coordinator: findData[i].coordinator,
                            company: findData[i].company,
                            source_document: findData[i].source_document,
                            contract_value: findData[i].contract_value,
                        }
                        //idData.push(findData[i].id_detail_file_poject)
                        dataTemp.push(dataProject);
                    }
                    let inputdataHistory = await model.detail_file_project_history.bulkCreate(dataTemp, { transaction: t });
                    console.log("disini")
                    let deleteData = await model.detail_file_project.destroy({
                        where: {
                            id_detail_file_project: { [Op.in]: id }
                        },
                        transaction: t
                    })
                    console.log("atau disini")
                    result = deleteData;
                    await t.commit();
                    responseStatus.resCreated(res, result);
                } else {
                    responseStatus.resBadRequest(res, "id project is empty")
                }
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        console.log(error)
        next(error)
    }
}

// controller.deleteProject = async (req, res, next) => {
//     let { data } = req.body

// const t = await db.transaction({
//     autoCommitTransactionalOFF: true,
// });

//     /*
//     data = {
//         "category" : "actual" / "temp",
//         "idProject" : [12,13]
//     }
//     */
//     try {
//         if (data) {
//             data = typeof data == "string" ? JSON.parse(data) : data
//             let result
//             if (data.idProject.length > 0) {
//                 if (data.category == "temp") {
//                     let deleteDataTemp = await model.detail_file_project_temp.destroy({
//                         where: {
//                             id_detail_file_project_temp: { [Op.in]: data.idProject }
//                         }, transaction: t
//                     })
//                     result = deleteDataTemp;
//                 } else {
//                     let findData = await model.detail_file_project.findAll({
//                         where: {
//                             id_detail_file_project: { [Op.in]: data.idProject }
//                         }
//                     })
//                     if (findData.length > 0) {
//                         let dataTemp = [];
//                         //let idData = [];
//                         for (let i = 0; i < findData.length; i++) {
//                             let dataProject = {
//                                 id_marketing: findData[i].id_marketing,
//                                 project_code: findData[i].project_code,
//                                 project_data_source: findData[i].project_data_source,
//                                 status_approval: findData[i].project_data_source,
//                                 approved_by: findData[i].approved_by,
//                                 approved_date: findData[i].approved_date,
//                                 id_keyword: findData[i].id_keyword,
//                                 input_date: findData[i].input_date,
//                                 package: findData[i].package,
//                                 url: findData[i].url,
//                                 pagu: findData[i].page,
//                                 id_procurement_type: findData[i].id_procurement_type,
//                                 //id_header_project: Sequelize.NUMBER,
//                                 created_at: findData[i].created_at,
//                                 created_by: findData[i].created_by,
//                                 updated_at: new Date(),
//                                 updated_by: req.username,
//                                 filename: findData[i].filename,
//                                 id_sub_dis: findData[i].id_sub_dis,
//                                 url: findData[i].url,
//                                 unit_value: findData[i].unit_value,
//                                 type_item: findData[i].type_item,
//                                 unit_set: findData[i].unit_set,
//                                 coordinator: findData[i].coordinator,
//                                 company: findData[i].company
//                             }
//                             //idData.push(findData[i].id_detail_file_poject)
//                             dataTemp.push(dataProject);
//                         }
//                         let inputdataHistory = await model.detail_file_project_history.bulkCreate(dataTemp, { transaction: t });
//                         let deleteData = await model.detail_file_project.destroy({
//                             where: {
//                                 id_detail_file_project: { [Op.in]: data.idProject }
//                             }, transaction: t
//                         })
//                         result = deleteData;
//                     }
//                 }
//                 await t.commit()
//                 responseStatus.resCreated(res, result);
//             } else {
//                 responseStatus.resBadRequest(res, "id project is empty")
//             }
//         } else {
//             responseStatus.resBadRequest(res, "Input data is empty")
//         }
//     } catch (error) {
//         if (t && !t.finished) await t.rollback();
//         next(error)
//     }
// }

controller.deleteProject = async (req, res, next) => {
    let { data } = req.body
    /*
    data = [{
        "category" : "actual" / "temp",
        "idProject" : [12,13]
    }]
    */
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    try {
        if (data) {
            data = data = typeof data == "string" ? JSON.parse(data) : data
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    if (data[i].category === "actual" || data[i].category === "approved") {
                        let findData = await model.detail_file_project.findAll({
                            where: {
                                id_detail_file_project: { [Op.in]: data[i].idProject }
                            }
                        })
                        if (findData.length > 0) {
                            let dataTemp = [];
                            for (let j = 0; j < findData.length; j++) {
                                let dataProject = {
                                    id_marketing: findData[j].id_marketing,
                                    project_code: findData[j].project_code,
                                    project_data_source: findData[j].project_data_source,
                                    status_approval: findData[j].project_data_source,
                                    approved_by: findData[j].approved_by,
                                    approved_date: findData[j].approved_date,
                                    id_keyword: findData[j].id_keyword,
                                    input_date: findData[j].input_date,
                                    package: findData[j].package,
                                    url: findData[j].url,
                                    pagu: findData[j].page,
                                    id_procurement_type: findData[j].id_procurement_type,
                                    //id_header_project: Sequelize.NUMBER,
                                    created_at: findData[j].created_at,
                                    created_by: findData[j].created_by,
                                    updated_at: new Date(),
                                    updated_by: req.username,
                                    filename: findData[j].filename,
                                    //id_sub_dis: findData[j].id_sub_dis,
                                    sub_dis: findData[j].sub_dis,
                                    url: findData[j].url,
                                    unit_value: findData[j].unit_value,
                                    type_item: findData[j].type_item,
                                    unit_set: findData[j].unit_set,
                                    coordinator: findData[j].coordinator,
                                    company: findData[j].company,
                                    source_document: findData[j].source_document,
                                    contract_value: findData[j].contract_value,
                                }
                                //idData.push(findData[i].id_detail_file_poject)
                                dataTemp.push(dataProject);
                            }
                            let inputdataHistory = await model.detail_file_project_history.bulkCreate(dataTemp, { transaction: t });
                            let deleteData = await model.detail_file_project.destroy({
                                where: {
                                    id_detail_file_project: { [Op.in]: data[i].idProject }
                                }, transaction: t
                            })
                        }
                    } else {
                        let deleteDataTemp = await model.detail_file_project_temp.destroy({
                            where: {
                                id_detail_file_project_temp: { [Op.in]: data[i].idProject }
                            }
                        })
                    }
                }
                responseStatus.resOK(res, "Data Deleted")
            } else {
                responseStatus.resBadRequest(res, 'input data is empty')
            }
        } else {
            responseStatus.resOK(res, "Success Deleted");
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}
controller.deleteProjects = async (req, res, next) => {
    let { data } = req.body
    /*
    data = [{
        "category" : "actual" / "temp",
        "idProject" : [12,13]
    }]
    */
    try {
        if (data) {
            data = data = typeof data == "string" ? JSON.parse(data) : data
            if (data.length > 0) {
                let config = {
                    headers: { authorization: `Bearer ${req.token}` }
                };
                for (let i = 0; i < data.length; i++) {
                    let dataId = JSON.stringify(data[i].idProject)
                    if (data[i].category === "actual" || data[i].category === "approved") {
                        console.log("actual")
                        await axios.delete(
                            `http://localhost:8033/delete-project-actual-api?id=${dataId}`,
                            config
                        )
                    } else {
                        console.log("temp")
                        await axios.delete(
                            `http://localhost:8033/delete-project-temp-api?id=${dataId}`,
                            config
                        )
                    }
                }
                responseStatus.resOK(res, "Success Deleted");
            } else {
                responseStatus.resBadRequest(res, 'input data is empty')
            }
        } else {
            responseStatus.resBadRequest(res, 'input data is empty')
        }
    } catch (error) {
        next(error)
    }
}
controller.getAllProjectNew = async (req, res, next) => {
    let { status, page, size, lang, searchWord, date } = req.body
    try {
        let condition = ["approve", "not approve"]

        // if (!status || !condition.includes(status)) {
        //     throw new ErrorResponse("Please insert status (approve / not approve)", 400)
        // }

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

        let listProject

        search.where[Op.and] = []
        if (!(req.role_level == 'Direktur' || req.role_level == 'Superadmin' || req.role_level == 'Admin')) {
            search.where[Op.and].push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })
        }

        if (status == "approve") {
            search.where[Op.and].push({ flag: 'actual' })
        } else if (status == "not approve") {
            search.where[Op.and].push({ flag: 'temp' })
        }

        listProject = await model.v_all_project.findAndCountAll(search)

        if (!listProject || listProject.rows.length < 1) {
            throw new ErrorResponse("Data not found!", 400)
        }

        for (let i = 0; i <= listProject.rows.length - 1; i++) {
            console.log(listProject.rows[i].id_project, "id_project")
            listProject.rows[i].dataValues.approved_date = listProject.rows[i].dataValues.approved_date !== null ? moment(listProject.rows[i].dataValues?.approved_date).format("YYYY-MM-DDTHH:mm:ss") + "Z" : null
            listProject.rows[i].dataValues.input_date = listProject.rows[i].dataValues.input_date !== null ? moment(listProject.rows[i].dataValues.input_date).format("YYYY-MM-DDTHH:mm:ss") + "Z" : null
            listProject.rows[i].dataValues.choose_date = listProject.rows[i].dataValues.choose_date !== null ? moment(listProject.rows[i].dataValues.choose_date).format("YYYY-MM-DDTHH:mm:ss") + "Z" : null
            listProject.rows[i].dataValues.created_at = listProject.rows[i].dataValues.created_at !== null ? moment(listProject.rows[i].dataValues.created_at).format("YYYY-MM-DDTHH:mm:ss") + "Z" : null
            listProject.rows[i].dataValues.updated_at = listProject.rows[i].dataValues.updated_at !== null ? moment(listProject.rows[i].dataValues.updated_at).format("YYYY-MM-DDTHH:mm:ss") + "Z" : null
            let lastProgress = await model.v_all_status_project.findOne({
                where: { id_project: listProject.rows[i].id_project },
                order: [['updated_at', 'desc']],
                limit: 1,
                logging: console.log
            })
            console.log(lastProgress)
            if (lastProgress) {
                listProject.rows[i].dataValues.id_status = lastProgress.id_status
                listProject.rows[i].dataValues.progress_remarks = lastProgress.description
                listProject.rows[i].dataValues.progress_value = lastProgress.value
                listProject.rows[i].dataValues.progress_flag = lastProgress.flag
            }
        }

        responseStatus.resOK(res, listProject)
    } catch (error) {
        next(error)
        console.log(error)
    }
}
controller.getAllProject = async (req, res, next) => {
    let { status, page, size, lang, searchWord } = req.body
    try {
        let condition = ["approve", "not approve"]

        if (!status || !condition.includes(status)) {
            throw new ErrorResponse("Please insert status (approve / not approve)", 400)
        }

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
                db.where(db.fn("lower", db.col("project_code")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                // )
                // search.where[Op.or].push(
                db.where(db.fn("lower", db.col("package")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            )
        }

        let listProject

        if (status == "approve") {
            listProject = await model.v_project_detail.findAndCountAll(search)
            for (let i = 0; i <= listProject.rows.length - 1; i++) {
                let lastProgress = await model.v_all_status_project.findOne({
                    where: { id_project: listProject.rows[i].id_detail_file_project },
                    order: [['updated_at', 'desc']],
                    limit: 1
                })
                if (lastProgress) {
                    listProject.rows[i].dataValues.id_status = lastProgress.id_status
                    listProject.rows[i].dataValues.progress_remarks = lastProgress.description
                    listProject.rows[i].dataValues.progress_value = lastProgress.value
                    listProject.rows[i].dataValues.progress_flag = lastProgress.flag
                }
            }
        } else if (status == "not approve") {
            listProject = await model.v_project_temp_detail.findAndCountAll(search)
        }

        if (!listProject || listProject.rows.length < 1) {
            throw new ErrorResponse("Data not found!", 400)
        }

        responseStatus.resOK(res, listProject)
    } catch (error) {
        next(error)
        console.log(error)
    }
}
controller.getOneProject = async (req, res, next) => {
    let { status, id_project } = req.body
    try {
        if (!id_project) {
            throw new ErrorResponse("Please insert id_project!", 400)
        }

        let condition = ["actual", "temp"]

        if (!status || !condition.includes(status)) {
            throw new ErrorResponse("Please insert status (approve / not approve)", 400)
        }

        let project

        if (status == "actual") {
            project = await model.v_project_detail.findOne({
                where: { id_detail_file_project: id_project }
            })
        } else if (status == "temp") {
            project = await model.v_project_temp_detail.findOne({
                where: { id_detail_file_project_temp: id_project }
            })
        }

        if (project) {
            project.input_date = project?.input_date !== null ? moment(project.input_date).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z" : null
            project.approved_date = project?.approved_date !== null ? moment(project.input_date).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z" : null
            project.created_at = project?.created_at !== null ? moment(project.created_at).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z" : null
            project.updated_at = project?.updated_at !== null ? moment(project.updated_at).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z" : null
        }

        if (!project) {
            throw new ErrorResponse("Data not found!", 400)
        }

        responseStatus.resOK(res, project)
    } catch (error) {
        next(error)
        console.log(error)
    }
}
controller.editDataProject = async (req, res, next) => {
    let { id_project } = req.query
    let { data } = req.body

    try {
        let findData = await model.detail_file_project_temp.findOne({
            where: {
                id_detail_file_project_temp: id_project
            }
        })
        if (findData) {
            let findNewDataSame = await model.detail_file_project_temp.findOne({
                where: {
                    [Op.and]: [
                        { id_detail_file_project_temp: { [Op.not]: id_project } },
                        { project_code: data.project_code }
                    ]
                }
            })
            if (findNewDataSame) {
                responseStatus.resNotAcceptable(res, "Data Project already exist")
            } else {
                let dataReceiver = []
                let dataTempRec = []
                let dataFix = {
                    id_marketing: data.id_marketing,
                    project_data_source: data.project_data_source,
                    status_approval: data.status_approval,
                    approved_by: data.approved_by,
                    approved_date: data.approved_date ? new Date(data.approved_date) : null,
                    id_keyword: data.id_keyword,
                    input_date: data.input_date,
                    package: data.package,
                    pagu: data.pagu,
                    id_procurement_type: data.id_procurement_type,
                    method: data.method,
                    choose_date: data.choose_date,
                    klpd: data.klpd,
                    work_unit: data.work_unit,
                    id_location: data.id_location,
                    fund_source: data.fund_source,
                    updated_at: new Date(),
                    updated_by: req.username,
                    filename: data.filename,
                    //id_sub_dis: data.id_sub_dis,
                    sub_dis: data.sub_dis,
                    url: data.url,
                    unit_value: data.unit_value,
                    type_item: data.type_item,
                    unit_set: data.unit_set,
                    coordinator: data.coordinator,
                    company: data.company,
                    source_document: data.source_document,
                    id_progress: data.id_progress,
                    contract_value: data.contract_value,
                }

                if (data.id_marketing) {
                    dataTempRec.push(data.id_marketing)
                }
                if (data.coordinator) {
                    dataTempRec.push(data.coordinator)
                }
                // if (data.id_sub_dis) {
                //     dataTempRec.push(data.id_sub_dis)
                // }

                if (dataTempRec.length > 0) {
                    let dataReceiverFind = await getReceiver({
                        receiver: dataTempRec,
                        parent: 'Master Project',
                        header: data.project_code,
                        credential: data.package // judul
                    })
                    console.log(dataReceiverFind, '++++')
                    if (dataReceiverFind.length > 0) {
                        dataReceiver = dataReceiver.concat(dataReceiverFind)
                    }
                }

                let updateData = await model.detail_file_project_temp.update(dataFix, {
                    where: {
                        id_detail_file_project_temp: id_project
                    }
                })

                if (dataReceiver.length > 0) {
                    console.log("masuk sini!!!")
                    for (let i = 0; i < dataReceiver.length; i++) {
                        let dataNotif = await payloadToNotif(dataReceiver[i].header, dataReceiver[i].credential, dataReceiver[i].receiver, req.id_profile, `http://localhost:3000/master/project?project_code=${dataReceiver[i].header}`)
                        let addToNotif = await addToTableHistoryNotif(dataNotif);
                        console.log(addToNotif, '+++++++++')
                        let pushNotifData = await pushNotif(dataNotif);
                        console.log(pushNotifData, "------------")
                    }
                }
                addToHistoryProject(findData);
                responseStatus.resCreated(res, updateData)
            }
        } else {
            responseStatus.resNotFound(res, "Data Project Not Found")
        }
    } catch (error) {
        next(error)
    }
}
controller.editProjectActual = async (req, res, next) => {
    let { id_project } = req.query
    let { data } = req.body
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    /*
        {
                    id_marketing: 1, // bisa diedit
                    project_code: 234,
                    id_sub_dis: findData[i].id_sub_dis, // bisa diedit
                    coordinator: , // bisa diedit
                    company: , // bisa diedit
        }

    */
    try {
        let checkDocument = await model.mst_document.findOne({
            where: {
                document_name: "project" // harus diinput dulu di master
            }
        })

        if (data) {
            data = typeof data == "string" ? JSON.parse(data) : data
            let findDataExist = await model.detail_file_project.findOne({
                where: {
                    id_detail_file_project: id_project
                }
            })
            let dataExist = {
                id_marketing: findDataExist.id_marketing,
                project_code: findDataExist.project_code,
                project_data_source: findDataExist.project_data_source,
                status_approval: findDataExist.project_data_source,
                approved_by: findDataExist.approved_by,
                approved_date: findDataExist.approved_date,
                id_keyword: findDataExist.id_keyword,
                input_date: findDataExist.input_date,
                package: findDataExist.package,
                pagu: findDataExist.page,
                id_procurement_type: findDataExist.id_procurement_type,
                //id_header_project: Sequelize.NUMBER,
                method: findDataExist.method,
                choose_date: findDataExist.choose_date,
                klpd: findDataExist.klpd,
                work_unit: findDataExist.work_unit,
                id_location: findDataExist.id_location,
                fund_source: findDataExist.fund_source,
                created_at: findDataExist.created_at,
                created_by: findDataExist.created_by,
                updated_at: new Date(),
                updated_by: req.username,
                filename: findDataExist.filename,
                //id_sub_dis: findDataExist.id_sub_dis,
                sub_dis: findDataExist.sub_dis,
                url: findDataExist.url,
                unit_value: findDataExist.unit_value,
                type_item: findDataExist.type_item,
                unit_set: findDataExist.unit_set,
                coordinator: findDataExist.coordinator,
                company: findDataExist.company,
                source_document: findDataExist.source_document,
                contract_value: findDataExist.contract_value,
            }

            let addToHistory = await model.detail_file_project_history.create(dataExist, { transaction: t })

            let result
            if (findDataExist) {
                if (checkDocument.approval === true) {
                    let findNewDataSame = await model.detail_file_project_temp.findOne({
                        where: {
                            project_code: data.project_code
                        }
                    })
                    if (findNewDataSame) {
                        responseStatus.resNotAcceptable(res, "Project is already exist")
                    } else {

                        let findDataProgress = await model.v_all_status_project.findOne({
                            where: {
                                [Op.and]: [
                                    { id_project: id_project },
                                    { flag: "actual" }
                                ]
                            }
                        })

                        dataExist.status_approval = null,
                            dataExist.approved_by = null,
                            dataExist.approved_date = null,
                            dataExist.id_progress = findDataProgress ? findDataProgress.id_status : null
                        dataExist.created_at = new Date()
                        dataExist.created_by = req.username
                        dataExist.updated_at = new Date()
                        dataExist.updated_by = req.username
                        dataExist.id_marketing = data.id_marketing
                        dataExist.company = data.company
                        dataExist.sub_dis = data.sub_dis
                        dataExist.coordinator = data.coordinator

                        result = await model.detail_file_project_temp.create(dataExist, { transaction: t })
                        let deleteToActual = await model.detail_file_project.destroy({
                            where: {
                                id_detail_file_project: id_project
                            },
                            transaction: t
                        })
                    }
                } else {
                    let findNewDataSame = await model.detail_file_project.findOne({
                        where: {
                            [Op.and]: [
                                { id_detail_file_project: { [Op.not]: id_project } },
                                { project_code: data.project_code }
                            ]
                        }
                    })
                    if (findNewDataSame) {
                        responseStatus.resNotAcceptable(res, "Project is already exist")
                    } else {
                        data.updated_by = req.username
                        data.updated_at = new Date()

                        result = await model.detail_file_project.update(data, { where: { id_detail_file_project: id_project }, transaction })
                    }
                }

                await t.commit()
                // notif
                let dataReceiver = []
                let dataTempRec = []
                if (data.id_marketing) {
                    dataTempRec.push(data.id_marketing)
                }
                if (data.coordinator) {
                    dataTempRec.push(data.coordinator)
                }
                // if (data.id_sub_dis) {
                //     dataTempRec.push(data.id_sub_dis)
                // }

                if (dataTempRec.length > 0) {
                    let dataReceiverFind = await getReceiver({
                        receiver: dataTempRec,
                        parent: 'Master Project',
                        header: data.project_code,
                        credential: dataExist.package // judul
                    })
                    console.log(dataReceiverFind, '++++')
                    if (dataReceiverFind.length > 0) {
                        dataReceiver = dataReceiver.concat(dataReceiverFind)
                    }
                }

                if (dataReceiver.length > 0) {
                    console.log("masuk sini!!!")
                    for (let i = 0; i < dataReceiver.length; i++) {
                        let dataNotif = await payloadToNotif(dataReceiver[i].header, dataReceiver[i].credential, dataReceiver[i].receiver, req.id_profile, `http://localhost:3000/master/project?project_code=${dataReceiver[i].header}`)
                        let addToNotif = await addToTableHistoryNotif(dataNotif);
                        console.log(addToNotif, '+++++++++')
                        let pushNotifData = await pushNotif(dataNotif);
                        console.log(pushNotifData, "------------")
                    }
                }
                responseStatus.resCreated(res, result)
            } else {
                responseStatus.resNotFound(res, "Data Not Found")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        console.log(error)
        next(error)
    }
}
controller.editDataProjectTempHistory = async (req, res, next) => {
    let { id_project } = req.query
    let { data } = req.body
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    /*
        {
                    id_marketing: 1, // bisa diedit
                    project_code: 234,
                    id_sub_dis: findData[i].id_sub_dis, // bisa diedit
                    coordinator: , // bisa diedit
                    company: , // bisa diedit
        }

    */

    try {
        // let checkDocument = await model.mst_document.findOne({
        //     where: {
        //         document_name: "project" // harus diinput dulu di master
        //     }
        // })

        if (data) {
            data = typeof data == "string" ? JSON.parse(data) : data

            let findDataExist = await model.detail_file_project_temp.findOne({
                where: {
                    id_detail_file_project_temp: id_project
                }
            })
            if (findDataExist) {
                addToHistoryProject(findDataExist);
                let updateData = await model.detail_file_project_temp.update(data, {
                    where: {
                        id_detail_file_project_temp: id_project
                    }
                })

                // notif
                let dataReceiver = []
                let dataTempRec = []
                if (data.id_marketing) {
                    dataTempRec.push(data.id_marketing)
                }
                if (data.coordinator) {
                    dataTempRec.push(data.coordinator)
                }

                if (dataTempRec.length > 0) {
                    let dataReceiverFind = await getReceiver({
                        receiver: dataTempRec,
                        parent: 'Master Project',
                        header: data.project_code,
                        credential: dataExist.package // judul
                    })
                    console.log(dataReceiverFind, '++++')
                    if (dataReceiverFind.length > 0) {
                        dataReceiver = dataReceiver.concat(dataReceiverFind)
                    }
                }

                if (dataReceiver.length > 0) {
                    console.log("masuk sini!!!")
                    for (let i = 0; i < dataReceiver.length; i++) {
                        let dataNotif = await payloadToNotif(dataReceiver[i].header, dataReceiver[i].credential, dataReceiver[i].receiver, req.id_profile, `http://localhost:3000/master/project?project_code=${dataReceiver[i].header}`)
                        let addToNotif = await addToTableHistoryNotif(dataNotif);
                        console.log(addToNotif, '+++++++++')
                        let pushNotifData = await pushNotif(dataNotif);
                        console.log(pushNotifData, "------------")
                    }
                }


                responseStatus.resCreated(res, updateData)
            } else {
                responseStatus.resNotFound(res, "Data Not Found")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        next(error)
    }
}
controller.checkEditProject = async (req, res, next) => {
    let { id_project, status, project } = req.query
    //let {data} = req.body
    try {
        if (status === 'actual') {
            responseStatus.resOK(res, {
                msg: "actual",
                url: "/update-project-actual?id_project=",
                method: "PUT",
                body: {
                    id_marketing: "", // bisa diedit
                    project_code: "",
                    //id_sub_dis: "", // bisa diedit
                    sub_dis: "",
                    coordinator: "", // bisa diedit
                    company: "" // bisa diedit
                }
            })
        } else {
            let findDataHistory = await model.detail_file_project_history.findOne({
                where: {
                    project_code: project
                }
            })

            if (findDataHistory) {
                responseStatus.resOK(res, {
                    msg: "temp-history",
                    url: "/update-project-temp-history?id_project=",
                    method: "PUT",
                    body: {
                        id_marketing: "", // bisa diedit 
                        project_code: "",
                        //id_sub_dis: "", // bisa diedit
                        sub_dis: "",
                        coordinator: "", // bisa diedit
                        company: "" // bisa diedit
                    }
                })
            } else {
                responseStatus.resOK(res, {
                    msg: "temp",
                    url: "/edit-data-project?id_project=",
                    method: "PUT",
                    body: "all"
                })
            }
        }
    } catch (error) {
        next(error)
    }
}
/*
APPROVE
- req body array id
- ambil project_code nya dari detail_file_project_temp
- cari di detail_file_project udah ada belum 
- kalo ada:
-- copy row yg project_code nya udah ada ke detail_file_project_history
-- delete itu detail_file_project
-- insert yg baru ke detail_file_project
- kalo gak ada:
-- langsung insert ke detail_file_project
*/
controller.approveProject = async (req, res, next) => {
    let { id, status, description } = req.body
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    try {
        if (!id || id.length < 1) {
            throw new ErrorResponse("Please insert id!", 400)
        }

        let projectApproval = await model.detail_file_project_temp.findAll({
            where: { id_detail_file_project_temp: id }
        })

        console.log("projectApproval", projectApproval)
        console.log("project approval length", projectApproval.length)

        let projectCodeApproval = []
        // let receiverData = []

        let dataReceiver = []
        for (let i = 0; i < projectApproval.length; i++) {
            let dataTempRec = []
            projectCodeApproval.push(projectApproval[i].project_code)

            let findDataBy = await model.mst_profile.findOne({
                where: {
                    username: projectApproval[i].created_by
                }
            })

            //if (findDataBy) dataTempRec.push(findDataBy.id_profile)

            if (projectApproval[i].id_marketing) dataTempRec.push(projectApproval[i].id_marketing)
            if (projectApproval[i].coordinator) dataTempRec.push(projectApproval[i].coordinator)
            //if (projectApproval[i].id_sub_dis) dataTempRec.push(projectApproval[i].id_sub_dis)

            if (dataTempRec.length > 0) {
                let dataReceiverFind = await getReceiver({
                    receiver: dataTempRec,
                    parent: 'Master Project',
                    header: projectApproval[i].project_code,
                    credential: `${status}-${projectApproval[i].package}` // judul
                })
                console.log(dataReceiverFind, '++++')
                if (dataReceiverFind.length > 0) {
                    if (findDataBy) {
                        dataReceiver.push({
                            receiver: findDataBy.id_profile,
                            credential: `${status}-${projectApproval[i].package}`,
                            header: projectApproval[i].project_code
                        })
                    }
                    dataReceiver = dataReceiver.concat(dataReceiverFind)
                }
            }
        }
        let checkProjectCode = await model.detail_file_project.findAll({
            where: { project_code: projectCodeApproval }
        })

        console.log("check project code", checkProjectCode)
        console.log("check project code LENGTH", checkProjectCode.length)

        if (status === "approved") {
            let dataInsertApprove = []

            projectApproval.map((data, index) => {
                console.log("index", index)
                dataInsertApprove.push({
                    id_marketing: data.id_marketing,
                    project_code: data.project_code,
                    project_data_source: data.project_data_source,
                    status_approval: "approved",
                    approved_by: req.username,
                    approved_date: new Date(),
                    id_keyword: data.id_keyword,
                    input_date: data.input_date,
                    package: data.package,
                    id_procurement_type: data.id_procurement_type,
                    method: data.method,
                    choose_date: data.choose_date,
                    work_unit: data.work_unit,
                    id_location: data.id_location,
                    fund_source: data.fund_source,
                    klpd: data.klpd,
                    created_at: data.created_at,
                    created_by: data.created_by,
                    updated_at: new Date(),
                    updated_by: req.username,
                    filename: data.filename,
                    //id_sub_dis: data.id_sub_dis,
                    sub_dis: data.sub_dis,
                    url: data.url,
                    pagu: data.pagu,
                    unit_value: data.unit_value,
                    type_item: data.type_item,
                    unit_set: data.unit_set,
                    coordinator: data.coordinator,
                    company: data.company,
                    source_document: data.source_document,
                    contract_value: data.id_progress == 5 ? data.pagu : data.contract_value,
                })
            })

            console.log("data insert approve", dataInsertApprove)

            // project temp nyimpen progresnya di field id_progres
            // project actual nyimpen progresnya di tabel status_project
            // jadi kalo dia approved, id_progres diadd baru ke status_project

            if (checkProjectCode.length > 0) {
                console.log("checkProjectCode.length > 0")
                // panggil function copy
                console.log("copy to history", id)
                // insert actual to history
                copyToHistory(id)
                // insert temp to actual
                let insertApprove = await model.detail_file_project.bulkCreate(dataInsertApprove, { transaction: t })
                // kalo project code nya ada, ambil id dari tabel actual
                let insertProgress = []
                for (let i = 0; i <= checkProjectCode.length - 1; i++) {
                    let searchStatus = await model.detail_file_project_temp.findOne({ where: { id_detail_file_project_temp: id } })
                    let findDataStatusValue = await model.mst_status.findOne({
                        where: {
                            id_status: searchStatus?.id_progress
                        }
                    })
                    console.log("search status", searchStatus)
                    console.log(findDataStatusValue, "data value ===")
                    insertProgress.push({
                        id_project: insertApprove[i]?.id_detail_file_project,
                        id_status: searchStatus?.id_progress,
                        value: findDataStatusValue.value,
                        created_at: new Date(),
                        created_by: req.username,
                        updated_at: new Date(),
                        updated_by: req.username,
                        approval_by: req.username,
                        approval_date: new Date()
                    })
                    console.log(insertProgress, "====")
                    // delete old actual data with id
                    let deleteOldActual = await model.detail_file_project.destroy({
                        where: { id_detail_file_project: checkProjectCode[i].id_detail_file_project },
                        transaction: t
                    })
                    console.log("destroy", deleteOldActual)
                }
                console.log("INSERT PROGRESS A", insertProgress)
                let bulkCreateProgress = await model.status_project.bulkCreate(insertProgress, { transaction: t })
                console.log("bulkCreateProgress", bulkCreateProgress)
                // delete data temp
                let deleteData = await model.detail_file_project_temp.destroy({
                    where: {
                        project_code: { [Op.in]: projectCodeApproval }
                    }, transaction: t
                })
            } else {
                if (projectApproval.length > 0) {
                    console.log("projectApproval.length > 0")
                    let insertApprove = await model.detail_file_project.bulkCreate(dataInsertApprove, { transaction: t })
                    // kalo project code nya gak ada, ambil id dari sequelize
                    let insertProgress = []
                    for (let i = 0; i <= insertApprove.length - 1; i++) {
                        console.log("insertApprove[" + i + "]?.iddetail_file_project", insertApprove[i]?.id_detail_file_project)
                        let searchStatus = await model.detail_file_project_temp.findOne({
                            where: {
                                id_detail_file_project_temp: id[i],
                                project_code: insertApprove[i]?.project_code
                            }
                        });
                        console.log("Search status", searchStatus)
                        console.log("search status[" + i + "]?.id_progress", searchStatus?.id_progress)
                        let findValue = await model.mst_status.findOne({
                            where: {
                                id_status: searchStatus?.id_progress
                            }
                        })
                        insertProgress.push({
                            id_project: insertApprove[i]?.id_detail_file_project,
                            id_status: searchStatus?.id_progress,
                            value: findValue?.value,
                            created_at: new Date(),
                            created_by: req.username,
                            updated_by: req.username,
                            updated_at: new Date(),
                            approval_by: req.username,
                            approval_date: new Date()
                        })
                    }
                    console.log("INSERT PROGRESS B", insertProgress)
                    let bulkCreateProgress = await model.status_project.bulkCreate(insertProgress, { transaction: t })
                    console.log("bulkcreateprogress", bulkCreateProgress)
                    let deleteTemp = await model.detail_file_project_temp.destroy({
                        where: { id_detail_file_project_temp: id },
                        transaction: t
                    })
                } else {
                    console.log("projectCodeApproval.length", projectCodeApproval.length)
                    for (let i = 0; i <= projectCodeApproval.length - 1; i++) {
                        let updateApproved = await model.detail_file_project.findAll(
                            {
                                status_approval: "approved",
                                approved_by: req.username,
                                approved_date: new Date(),
                                updated_at: new Date(),
                                updated_by: req.username,
                            },
                            { where: { project_code: projectCodeApproval[i] } }
                        )
                    }
                }
            }
        }
        else if (status === "rejected") {
            let updateTableTemp = await model.detail_file_project_temp.update(
                {
                    description: description,
                    status_approval: "rejected",
                    updated_at: new Date(),
                    updated_by: req.username,
                },
                { where: { id_detail_file_project_temp: id } },
                { transaction: t }
            );

            // if (checkProjectCode.length > 0) {
            //     // panggil function copy
            //     console.log("copy to history", id)
            //     copyToHistory(id)
            // }
        }



        //for
        await t.commit()

        // Notif

        if (dataReceiver.length > 0) {
            console.log("masuk sini!!!")
            for (let i = 0; i < dataReceiver.length; i++) {
                let dataNotif = await payloadToNotif(dataReceiver[i].header, dataReceiver[i].credential, dataReceiver[i].receiver, req.id_profile, `http://localhost:3000/master/project?project_code=${dataReceiver[i].header}`)
                let addToNotif = await addToTableHistoryNotif(dataNotif);
                console.log(addToNotif, '+++++++++')
                let pushNotifData = await pushNotif(dataNotif);
                console.log(pushNotifData, "------------")
            }
        }
        return responseStatus.resOK(res, "Data success approved!")
    } catch (error) {
        console.log(error)
        if (t && !t.finished) await t.rollback();
        next(error)

    }
}
controller.approveProject2 = async (req, res, next) => {
    let { id, status, description } = req.body
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    try {
        if (!id || id.length < 1) {
            throw new ErrorResponse("Please insert id!", 400)
        }

        let dataReceiver = []
        let dataTempRec = []

        for (let i = 0; i <= id.length - 1; i++) {
            console.log("i", i)
            console.log("id", id)
            if (status === "approved") {
                let projectApproval = await model.detail_file_project_temp.findOne({
                    where: { id_detail_file_project_temp: id[i] }
                })

                // notif
                if (projectApproval?.id_marketing) dataTempRec.push(projectApproval?.id_marketing)
                if (projectApproval?.coordinator) dataTempRec.push(projectApproval?.coordinator)
                //if (projectApproval?.id_sub_dis) dataTempRec.push(projectApproval?.id_sub_dis)
                let findDataBy = await model.mst_profile.findOne({ where: { username: projectApproval?.created_by } })
                if (dataTempRec.length > 0) {
                    let dataReceiverFind = await getReceiver({
                        receiver: dataTempRec,
                        parent: 'Master Project',
                        header: projectApproval?.project_code,
                        credential: `${status}-${projectApproval?.package}` // judul
                    })
                    console.log(dataReceiverFind, '++++')
                    if (dataReceiverFind.length > 0) {
                        if (findDataBy) {
                            dataReceiver.push({
                                receiver: findDataBy.id_profile,
                                credential: `${status}-${projectApproval?.package}`,
                                header: projectApproval?.project_code
                            })
                        }
                        dataReceiver = dataReceiver.concat(dataReceiverFind)
                    }
                }
                // notif end

                let checkProjectCode = await model.detail_file_project.findOne({
                    where: { project_code: projectApproval?.project_code }
                })
                let dataInsertApprove = {
                    id_marketing: projectApproval?.id_marketing,
                    project_code: projectApproval?.project_code,
                    project_data_source: projectApproval?.project_data_source,
                    status_approval: "approved",
                    approved_by: req.username,
                    approved_date: new Date(),
                    id_keyword: projectApproval?.id_keyword,
                    input_date: projectApproval?.input_date,
                    package: projectApproval?.package,
                    id_procurement_type: projectApproval?.id_procurement_type,
                    method: projectApproval?.method,
                    choose_date: projectApproval?.choose_date,
                    work_unit: projectApproval?.work_unit,
                    id_location: projectApproval?.id_location,
                    fund_source: projectApproval?.fund_source,
                    klpd: projectApproval?.klpd,
                    created_at: projectApproval?.created_at,
                    created_by: projectApproval?.created_by,
                    updated_at: new Date(),
                    updated_by: req.username,
                    filename: projectApproval?.filename,
                    //id_sub_dis: projectApproval?.id_sub_dis,
                    sub_dis: projectApproval?.sub_dis,
                    url: projectApproval?.url,
                    pagu: projectApproval?.pagu,
                    unit_value: projectApproval?.unit_value,
                    type_item: projectApproval?.type_item,
                    unit_set: projectApproval?.unit_set,
                    coordinator: projectApproval?.coordinator,
                    company: projectApproval?.company,
                    source_document: projectApproval?.source_document,
                    contract_value: projectApproval?.id_progress == 5 ? projectApproval?.pagu : projectApproval?.contract_value,
                }
                if (checkProjectCode) {
                    console.log("check project code exist")
                    copyToHistory(id[i])
                    console.log("copy to history ")
                    let insertApprove = await model.detail_file_project.create(dataInsertApprove, { transaction: t })
                    console.log("insert approve A", dataInsertApprove)
                    let findDataStatusValue = await model.mst_status.findOne({ where: { id_status: projectApproval?.id_progress } })
                    let insertProgress = {
                        id_project: insertApprove?.id_detail_file_project,
                        id_status: projectApproval?.id_progress,
                        value: findDataStatusValue?.value,
                        created_at: new Date(),
                        created_by: req.username,
                        updated_at: new Date(),
                        updated_by: req.username,
                        approval_by: req.username,
                        approval_date: new Date()
                    }
                    console.log("insert progress A", insertProgress)
                    let deleteOldActual = await model.detail_file_project.destroy({
                        where: { id_detail_file_project: checkProjectCode?.id_detail_file_project },
                        transaction: t
                    })
                    let insertStatusProject = await model.status_project.create(insertProgress, { transaction: t })
                    let deleteTemp = await model.detail_file_project_temp.destroy({
                        where: { project_code: checkProjectCode?.project_code },
                        transaction: t
                    })
                } else {
                    console.log("check project code not exist")
                    let insertApprove = await model.detail_file_project.create(dataInsertApprove, { transaction: t })
                    console.log("insert approve B", dataInsertApprove)
                    let findDataStatusValue = await model.mst_status.findOne({ where: { id_status: projectApproval?.id_progress } })
                    let insertProgress = {
                        id_project: insertApprove?.id_detail_file_project,
                        id_status: projectApproval?.id_progress,
                        value: findDataStatusValue?.value,
                        created_at: new Date(),
                        created_by: req.username,
                        updated_at: new Date(),
                        updated_by: req.username,
                        approval_by: req.username,
                        approval_date: new Date()
                    }
                    let insertStatusProject = await model.status_project.create(insertProgress, { transaction: t })
                    console.log("insert progress B", insertProgress)
                    let deleteTemp = await model.detail_file_project_temp.destroy({
                        where: { project_code: projectApproval?.project_code },
                        transaction: t
                    })
                }
            } else {
                let updateTableTemp = await model.detail_file_project_temp.update(
                    {
                        description: description,
                        status_approval: "rejected",
                        updated_at: new Date(),
                        updated_by: req.username,
                    },
                    { where: { id_detail_file_project_temp: id[i] } },
                    { transaction: t }
                );
            }
        }

        //for
        await t.commit()

        // Notif

        if (dataReceiver.length > 0) {
            console.log("masuk sini!!!")
            for (let i = 0; i < dataReceiver.length; i++) {
                let dataNotif = await payloadToNotif(dataReceiver[i].header, dataReceiver[i].credential, dataReceiver[i].receiver, req.id_profile, `http://localhost:3000/master/project?project_code=${dataReceiver[i].header}`)
                let addToNotif = await addToTableHistoryNotif(dataNotif);
                console.log(addToNotif, '+++++++++')
                let pushNotifData = await pushNotif(dataNotif);
                console.log(pushNotifData, "------------")
            }
        }

        return responseStatus.resOK(res, "Data success approved!")
    } catch (error) {
        console.log(error)
        if (t && !t.finished) await t.rollback();
        next(error)

    }
}
controller.approveStatusProject = async (req, res, next) => {
    let { id } = req.body
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    try {
        if (!id || id.length < 1) {
            throw new ErrorResponse("Please insert id!", 400)
        }

        let statusProjectApproval = await model.status_project_temp.findAll({
            where: { id_project: id }
        })
        console.log("status approval length", statusProjectApproval.length)

        let dataInsertApprove = []
        let dataReceiver = []
        for (let i = 0; i < statusProjectApproval.length; i++) {
            let dataTempRec = []
            let findValue = await model.mst_status.findOne({ where: { id_status: statusProjectApproval[i].id_status } })
            dataInsertApprove.push({
                id_project: statusProjectApproval[i].id_project,
                id_status: statusProjectApproval[i].id_status,
                value: findValue?.value,
                description: statusProjectApproval[i].description,
                created_at: statusProjectApproval[i].created_at,
                created_by: statusProjectApproval[i].created_by,
                updated_at: new Date(),
                updated_by: req.username,
                approval_by: req.username,
                approval_date: new Date(),
                status_approval: "approved"
            })
            // notif rec
            let findDataBy = await model.mst_profile.findOne({
                where: {
                    username: statusProjectApproval[i].created_by
                }
            })
            let findProject = await model.detail_file_project.findOne({
                where: {
                    id_detail_file_project: statusProjectApproval[i].id_project
                }
            })

            if (statusProjectApproval[i].id_status == 5) {
                console.log("masuk sini")
                let updateDataProject = await model.detail_file_project.update({
                    contract_value: statusProjectApproval[i].contract_value,
                    updated_at: new Date(),
                    updated_by: req.username
                }, { where: { id_detail_file_project: statusProjectApproval[i].id_project } })
            }

            let findDataByProject = await model.mst_profile.findOne({
                where: {
                    username: findProject.created_by
                }
            })
            if (findProject.id_marketing) dataTempRec.push(findProject.id_marketing)
            if (findProject.coordinator) dataTempRec.push(findProject.coordinator)
            // if (findProject.id_sub_dis) dataTempRec.push(findProject.id_sub_dis)

            let findDataValue = await model.mst_status.findOne({
                where: {
                    id_status: statusProjectApproval[i].id_status
                }
            })

            if (dataTempRec.length > 0) {
                let dataReceiverFind = await getReceiver({
                    receiver: dataTempRec,
                    parent: 'Status Project',
                    header: findProject.project_code,
                    credential: `Approved Project ${findProject.project_code} - ${findDataValue.value}%`
                })
                console.log(dataReceiverFind, '++++')
                if (dataReceiverFind.length > 0) {
                    if (findDataBy) {
                        dataReceiver.push({
                            receiver: findDataBy.id_profile,
                            header: findProject.project_code,
                            credential: `Approved Project ${findProject.project_code} - ${findDataValue.value}%`
                        })
                    }
                    if (findDataByProject) {
                        dataReceiver.push({
                            receiver: findDataByProject.id_profile,
                            header: findProject.project_code,
                            credential: `Approved Project ${findProject.project_code} - ${findDataValue.value}%`
                        })
                    }
                    dataReceiver = dataReceiver.concat(dataReceiverFind)
                }
            }
        }
        // statusProjectApproval.map((data, index) => {
        //     console.log("index", index)
        //     dataInsertApprove.push({
        //         id_project: data.id_project,
        //         id_status: data.id_status,
        //         description: data.description,
        //         created_at: data.created_at,
        //         created_by: data.created_by,
        //         updated_at: new Date(),
        //         updated_by: req.username,
        //         approval_by: req.username,
        //         approval_date: new Date(),
        //         status_approval: "approved"
        //     })
        // })
        console.log("data insert approve", dataInsertApprove)

        let insertApprove = await model.status_project.bulkCreate(dataInsertApprove, { transaction: t })
        let deleteTemp = await model.status_project_temp.destroy({
            where: { id_project: id },
            transaction: t
        })

        await t.commit()
        // send notif
        if (dataReceiver.length > 0) {
            console.log("masuk sini!!!")
            for (let i = 0; i < dataReceiver.length; i++) {
                let dataNotif = await payloadToNotif(dataReceiver[i].header, dataReceiver[i].credential, dataReceiver[i].receiver, req.id_profile, `http://localhost:3000/master/activityMarketing?project_code=${dataReceiver[i].header}`)
                let addToNotif = await addToTableHistoryNotif(dataNotif);
                console.log(addToNotif, '+++++++++')
                let pushNotifData = await pushNotif(dataNotif);
                console.log(pushNotifData, "------------")
            }
        }
        return responseStatus.resOK(res, "Data success approved!")
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        next(error)
        console.log(error)
    }
}
controller.rejectStatusProject = async (req, res, next) => {
    let { id } = req.body
    try {
        if (id) {
            id = typeof id == "string" ? JSON.parse(id) : id
            if (id.length > 0) {
                let statusProjectRejected = await model.status_project_temp.findAll({
                    where: { id_project: id }
                })

                let dataReceiver = []
                for (let i = 0; i < statusProjectRejected.length; i++) {
                    let dataTempRec = []
                    let dataUpdate = {
                        id_project: statusProjectRejected[i].id_project,
                        id_status: statusProjectRejected[i].id_status,
                        description: statusProjectRejected[i].description,
                        updated_at: new Date(),
                        updated_by: req.username,
                        approval_by: req.username,
                        approval_date: new Date(),
                        status_approval: "rejected"
                    }

                    //notif
                    let findDataBy = await model.mst_profile.findOne({
                        where: {
                            username: statusProjectRejected[i].created_by
                        }
                    })
                    let findProject = await model.detail_file_project.findOne({
                        where: {
                            id_detail_file_project: statusProjectRejected[i].id_project
                        }
                    })
                    let findDataByProject = await model.mst_profile.findOne({
                        where: {
                            username: findProject.created_by
                        }
                    })
                    if (findProject.id_marketing) dataTempRec.push(findProject.id_marketing)
                    if (findProject.coordinator) dataTempRec.push(findProject.coordinator)
                    //if (findProject.id_sub_dis) dataTempRec.push(findProject.id_sub_dis)

                    let findDataValue = await model.mst_status.findOne({
                        where: {
                            id_status: statusProjectRejected[i].id_status
                        }
                    })

                    if (dataTempRec.length > 0) {
                        let dataReceiverFind = await getReceiver({
                            receiver: dataTempRec,
                            parent: 'Status Project',
                            header: findProject.project_code,
                            credential: `Rejected Project ${findProject.project_code} - ${findDataValue.value}%`
                        })
                        console.log(dataReceiverFind, '++++')
                        if (dataReceiverFind.length > 0) {
                            if (findDataBy) {
                                dataReceiver.push({
                                    receiver: findDataBy.id_profile,
                                    header: findProject.project_code,
                                    credential: `Rejected Project ${findProject.project_code} - ${findDataValue.value}%`
                                })
                            }
                            if (findDataByProject) {
                                dataReceiver.push({
                                    receiver: findDataByProject.id_profile,
                                    header: findProject.project_code,
                                    credential: `Rejected Project ${findProject.project_code} - ${findDataValue.value}%`
                                })
                            }
                            dataReceiver = dataReceiver.concat(dataReceiverFind)
                        }
                    }

                    let updateStatusProjectReject = await model.status_project_temp.update(dataUpdate, {
                        where: {
                            id_status_project_temp: statusProjectRejected[i].id_status_project_temp
                        }
                    })
                }
                // let dataUpdate = {
                //     updated_at: new Date(),
                //     updated_by: req.username,
                //     status_approval: 'rejected',
                //     approval_by: req.username,
                //     approval_date: new Date()
                // }

                // send notif
                if (dataReceiver.length > 0) {
                    console.log("masuk sini!!!")
                    for (let i = 0; i < dataReceiver.length; i++) {
                        let dataNotif = await payloadToNotif(dataReceiver[i].header, dataReceiver[i].credential, dataReceiver[i].receiver, req.id_profile, `http://localhost:3000/master/activityMarketing?project_code=${dataReceiver[i].header}`)
                        let addToNotif = await addToTableHistoryNotif(dataNotif);
                        console.log(addToNotif, '+++++++++')
                        let pushNotifData = await pushNotif(dataNotif);
                        console.log(pushNotifData, "------------")
                    }
                }
                responseStatus.resCreated(res, "rejected")
            } else {
                responseStatus.resBadRequest(res, "Input data is empty")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        next(error)
    }
}
controller.updateStatusProject = async (req, res, next) => {
    let { id } = req.query
    let { data } = req.body
    try {
        //data.map(x =>{
        data.updated_at = new Date()
        data.updated_by = req.username
        data.status_approval = null,
            data.approval_date = null,
            data.approval_by = null
        //})
        let update = await model.status_project_temp.update(data, {
            where: {
                id_status_project_temp: id
            }
        })
        responseStatus.resCreated(res, update)
    } catch (error) {
        next(error)
    }
}
async function buildHierarchy(data, parentId = null) {
    const hierarchy = [];

    for (const item of data) {
        if (item.dataValues.id_leader === parentId) {
            const children = await buildHierarchy(data, item.dataValues.id_profile);
            console.log(children, '+++++++++')
            if (children.length > 0) {
                item.dataValues.profiles = children;
            }
            hierarchy.push(item.dataValues);
        }
    }

    return hierarchy;
}
// structure organ
controller.getHierarchy = async (req, res, next) => {
    try {
        let findAllDataStructure = await model.v_mst_marketing.findAll({
            // where: {
            //   status: {
            //     [Op.ne]: "non active"
            //   }
            // }
        });
        console.log(findAllDataStructure)
        if (findAllDataStructure.length > 0) {
            let result = await buildHierarchy(findAllDataStructure);
            responseStatus.resOK(res, result)
        } else {
            responseStatus.resNotFound(res, "Data Empty")
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}
controller.addStructureOrgan = async (req, res, next) => {
    let { id_profile, id_leader } = req.body
    try {
        const structureOrgan = "CALL insert_structure_organ(:p_id_profile, :p_id_leader , :p_username , :p_datetime )";
        const parameter = {
            p_id_profile: id_profile,
            p_id_leader: id_leader,
            p_username: req.username,
            p_datetime: new Date()
        }
        db.query(structureOrgan, {
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
                    return responseStatus.resNotAcceptable(res, "Data Structure Organ is Already Exist");
                } else {
                    return responseStatus.resInternalServerError(res, error);
                }
            });
    } catch (error) {
        next(error)
    }
}
controller.addStructureOrganArray = async (req, res, next) => {
    let { data } = req.body
    try {
        if (data) {
            data = typeof data == 'string' ? JSON.parse(data) : data
            if (data.length > 0) {
                let dataAddFix = data.map((item) => ({
                    ...item,
                    status: "active",
                    created_at: new Date(),
                    created_by: req.username,
                    updated_at: new Date(),
                    updated_by: req.username
                }));
                let add = await model.structure_organ.bulkCreate(dataAddFix);
                responseStatus.resCreated(res, add)
            } else {
                responseStatus.resBadRequest(res, "Data inputan null")
            }
        } else {
            responseStatus.resBadRequest(res, "Data inputan null")
        }
    } catch (error) {
        next(error)
    }
}
controller.editDownEmployee = async (req, res, next) => {
    let { data } = req.body
    /*
    [
        1, 2 // id_profile
    ]
    */
    try {
        if (data) {
            console.log("masuk sini")
            data = typeof data == 'string' ? JSON.parse(data) : data
            if (data.length > 0) {
                let updateDataDown = await model.structure_organ.update({
                    status: "non active",
                    updated_at: new Date(),
                    updated_by: req.username
                }, {
                    where: {
                        id_leader: { [Op.in]: data }
                    }
                })
                console.log(updateDataDown, '========')
                responseStatus.resOK(res, "success")
            } else {
                responseStatus.resBadRequest(res, "Data inputan null")
            }
        } else {
            responseStatus.resBadRequest(res, "Data inputan null")
        }
    } catch (error) {
        next(error)
    }
}
controller.editUpEmployee = async (req, res, next) => {
    let { data } = req.body
    try {
        if (data) {
            data = typeof data == 'string' ? JSON.parse(data) : data
            if (data.length > 0) {
                let updateDataUp = await model.structure_organ.update({
                    status: "non active",
                    updated_at: new Date(),
                    updated_by: req.username
                }, {
                    where: {
                        id_profile: { [Op.in]: data }
                    }
                })
                responseStatus.resOK(res, "success")
            } else {
                responseStatus.resBadRequest(res, "Data inputan null")
            }
        } else {
            responseStatus.resBadRequest(res, "Data inputan null")
        }
    } catch (error) {
        next(error)
    }
}
controller.getOneStructureOrgan = async (req, res, next) => {
    let { id_structure_organ, id_profile, id_leader } = req.query
    try {
        let search = {
            where: {

            },
            include: [
                { model: model.mst_profile, as: "profile" },
                { model: model.mst_profile, as: "leader" }
            ],
        }
        if (id_structure_organ) {
            search.where[Op.or] = []
        }

        if (id_profile || id_leader) {
            search.where[Op.and] = []
        }

        if (id_structure_organ) {
            search.where[Op.or].push(
                { id_structure_organ: id_structure_organ }
            )
        }
        // if (id_profile && !(req.role_level == 'Direktur' || req.role_level == 'Superadmin' || req.role_level == 'Admin')) {
        //     console.log("masuk sini")
        //     search.where[Op.and].push(
        //         { id_profile: +id_profile },
        //         { status: null }
        //     )
        // }
        if (id_leader) {
            search.where[Op.and].push(
                { id_leader: id_leader },
                { status: null }
            )
        }

        let dataStructureOrgan = await model.structure_organ.findOne(search)

        if (dataStructureOrgan) {
            console.log(dataStructureOrgan)

            let findLeader = await model.mst_profile.findOne({
                where: {
                    id_profile: dataStructureOrgan.id_leader
                }
            })
            if (findLeader) {
                dataStructureOrgan.dataValues.leader = findLeader
            }
            responseStatus.resOK(res, dataStructureOrgan)
        } else {
            responseStatus.resNotFound(res, "Data Structure Organ Not Found")
        }
    } catch (error) {
        next(error)
    }
}
controller.editStructureOrgan = async (req, res, next) => {
    let { id_structure_organ } = req.query
    let { id_profile, id_leader } = req.body
    try {
        let parameter = {
            p_id_profile: id_profile,
            p_id_leader: id_leader,
            p_username: req.username,
            p_datetime: new Date(),
            p_id_structure_organ: id_structure_organ
        }
        const result = await db.query(
            'SELECT update_structure_organ(:p_id_structure_organ, :p_id_profile, :p_id_leader, :p_username, :p_datetime) as result_text',
            {
                replacements: parameter,
                type: Sequelize.QueryTypes.SELECT,
            }
        )
            .then((results) => {
                console.log(results)
                if (results[0].result_text === 'Data updated successfully') {
                    return responseStatus.resCreated(res, results);
                } else if (results[0].result_text === 'Structure Organ is Already Exist') {
                    return responseStatus.resNotAcceptable(res, results);
                } else {
                    return responseStatus.resNotFound(res, results);
                }
            })
            .catch((error) => {
                next(error)
            });
    } catch (error) {
        next(error)
    }
}
controller.deleteStrucktur = async (req, res, next) => {
    let { id_structure_organ } = req.query;
    try {
        let findData = await model.structure_organ.findOne({
            where: {
                id_structure_organ: id_structure_organ
            }
        })
        if (findData) {
            let findAllChild = await model.structure_organ.findAll({
                where: {
                    id_leader: findData.id_profile
                }
            })
            if (findAllChild.length > 0) {
                for (let i = 0; i < findAllChild.length; i++) {
                    let updateDataChild = await model.structure_organ.update({
                        id_leader: null,
                        updated_by: req.username,
                        updated_at: new Date()
                    }, {
                        where: {
                            id_structure_organ: findAllChild[i].id_structure_organ
                        }
                    })
                }
            }

            let deleteData = await model.structure_organ.destroy({
                where: {
                    id_structure_organ: id_structure_organ
                }
            })
            responseStatus.resOK(res, deleteData)
        } else {
            responseStatus.resNotFound(res, "Data Structur Organ Not Found")
        }
    } catch (error) {
        next(error)
    }
}
controller.updateStructureOrgan = async (req, res, next) => {
    let { dataId, dataAdd } = req.body
    try {
        if (dataId) {
            dataId = typeof dataId == 'string' ? JSON.parse(dataId) : dataId
            for (let i = 0; i < dataId.length; i++) {
                let updateData = await model.structure_organ.update({
                    status: "non active",
                    updated_at: new Date(),
                    updated_by: req.username
                }, {
                    where: dataId[i]
                })
            }
            if (dataAdd) {
                dataAdd = typeof dataAdd == 'string' ? JSON.parse(dataAdd) : dataAdd
                let dataAddFix = dataAdd.map((item) => ({
                    ...item,
                    status: "active",
                    created_at: new Date(),
                    created_by: req.username,
                    updated_at: new Date(),
                    updated_by: req.username
                }));
                let add = await model.structure_organ.bulkCreate(dataAddFix);
            }
            responseStatus.resOK(res, "Success")
        } else {
            responseStatus.resBadRequest(res, "Data inputan null")
        }
    } catch (error) {
        next(error)
    }
}
controller.filterStructureOrgan = async (req, res, next) => {
    try {
        let dataUser = []
        let findAllUser = await model.mst_profile.findAll({
            where: {
                status: null
            }
        })
        if (findAllUser.length > 0) {
            for (let i = 0; i < findAllUser.length; i++) {
                let findStructure = await model.v_mst_marketing.findOne({
                    where: {
                        [Op.or]: [
                            { id_profile: findAllUser[i].id_profile },
                            { id_leader: findAllUser[i].id_profile }
                        ]
                    }
                })

                if (!findStructure) {
                    dataUser.push(findAllUser[i])
                }
            }
            responseStatus.resOK(res, dataUser)
        } else {
            responseStatus.resNotFound(res, "No Data Found")
        }
    } catch (error) {
        next(error)
    }
}

// statusProject
controller.addStatusProject = async (req, res, next) => {
    let { data } = req.body
    let checkDocument = await model.mst_document.findOne({
        where: {
            document_name: "status_project" // harus diinput dulu di master
        }
    })
    try {
        if (data) {
            data = typeof data == "string" ? JSON.parse(data) : data
            if (checkDocument) {

                let findDataValue = await model.mst_status.findOne({
                    where: {
                        id_status: data.id_status
                    }
                })

                data.value = findDataValue.value

                const structureOrgan = "CALL insert_status_project(:p_id_project, :p_id_status , :p_username , :p_datetime, :p_description, :p_condition, :p_value)";
                const parameter = {
                    p_id_project: data.id_project,
                    p_id_status: data.id_status,
                    p_username: req.username,
                    p_datetime: new Date(),
                    p_description: data.description,
                    p_condition: checkDocument.approval,
                    p_value: data.value
                }
                db.query(structureOrgan, {
                    replacements: parameter,
                    type: Sequelize.QueryTypes.RAW, // Use RAW query type for stored procedures
                })
                    .then((results) => {
                        console.log('Procedure executed successfully:', results);
                        return responseStatus.resCreated(res, parameter)
                    })
                    .catch((error) => {
                        console.log(error, "-")
                        return responseStatus.resInternalServerError(res, error);
                    });
            } else {
                responseStatus.resNotAcceptable(res, "Document transaction not found, please insert document first")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        next(error)
    }
}
controller.addStatusProjectBulk = async (req, res, next) => {
    let { data } = req.body
    /*
    data : [
        {
            id_project : "",
            id_status : "",
            description : "",
            contract_value : 0
        }
    ]
    */
    try {
        let checkDocument = await model.mst_document.findOne({
            where: {
                document_name: "status_project" // harus diinput dulu di master
            }
        })
        if (data) {
            data = typeof data == "string" ? JSON.parse(data) : data
            if (data.length > 0) {
                let dataReceiver = []
                if (checkDocument) {
                    let addStatus

                    for (let i = 0; i < data.length; i++) {
                        let dataTempRec = []
                        data[i].created_at = new Date()
                        data[i].created_by = req.username
                        data[i].updated_at = new Date()
                        data[i].updated_by = req.username

                        let findDataValue = await model.mst_status.findOne({
                            where: {
                                id_status: data[i].id_status
                            }
                        })
                        let findProject = await model.detail_file_project.findOne({
                            where: {
                                id_detail_file_project: data[i].id_project
                            }
                        })
                        if (checkDocument.approval == false) {
                            data[i].value = findDataValue.value

                            if (data[i].status == 5) {
                                let updateDataProject = await model.detail_file_project.update({
                                    contract_value: data[i].contract_value,
                                    updated_at: new Date(),
                                    updated_by: req.username
                                }, { where: { id_detail_file_project: data[i].id_project } })
                            }
                        }

                        if (findProject.id_marketing) dataTempRec.push(findProject.id_marketing)
                        if (findProject.coordinator) dataTempRec.push(findProject.coordinator)
                        //if (findProject.id_sub_dis) dataTempRec.push(findProject.id_sub_dis)

                        let findDataBy = await model.mst_profile.findOne({
                            where: {
                                username: findProject.created_by
                            }
                        })

                        if (dataTempRec.length > 0) {
                            let dataReceiverFind = await getReceiver({
                                receiver: dataTempRec,
                                parent: 'Status Project',
                                header: findProject.project_code,
                                credential: `Update Project ${findProject.project_code} - ${findDataValue.value}%`
                            })
                            console.log(dataReceiverFind, '++++')
                            if (dataReceiverFind.length > 0) {
                                if (findDataBy) {
                                    dataReceiver.push({
                                        receiver: findDataBy.id_profile,
                                        header: findProject.project_code,
                                        credential: `Update Project ${findProject.project_code} - ${findDataValue.value}%`
                                    })
                                }
                                dataReceiver = dataReceiver.concat(dataReceiverFind)
                            }
                        }
                    }

                    if (checkDocument.approval == true) {
                        addStatus = await model.status_project_temp.bulkCreate(data);
                    } else {
                        data.map(x => {
                            x.approval_by = req.username,
                                x.approval_date = new Date(),
                                x.status_approval = "approved"
                        })

                        addStatus = await model.status_project.bulkCreate(data);
                    }

                    // Notif
                    // let dataReceiverApproval = await getReceiverToApprove("Approval Status Project")

                    if (dataReceiver.length > 0) {
                        console.log("masuk sini!!!")
                        for (let i = 0; i < dataReceiver.length; i++) {
                            let dataNotif = await payloadToNotif(dataReceiver[i].header, dataReceiver[i].credential, dataReceiver[i].receiver, req.id_profile, `http://localhost:3000/master/activityMarketing?project_code=${dataReceiver[i].header}`)
                            let addToNotif = await addToTableHistoryNotif(dataNotif);
                            console.log(addToNotif, '+++++++++')
                            let pushNotifData = await pushNotif(dataNotif);
                            console.log(pushNotifData, "------------")
                        }
                    }

                    responseStatus.resCreated(res, addStatus)
                } else {
                    responseStatus.resNotAcceptable(res, "Document transaction not found, please insert document first")
                }
            } else {
                responseStatus.resBadRequest(res, "Input data is empty")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        next(error)
    }
}
controller.getAllDataStatusProject = async (req, res, next) => {
    let { status, page, size, lang, searchWord } = req.body
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
                [Op.and]: []
            },
            logging: console.log
        }

        if (limit != 0 && offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (!(req.role_level == 'Direktur' || req.role_level == 'Superadmin' || req.role_level == 'Admin')) {
            search.where[Op.and].push({ id_marketing: req.id_profile });
        }

        if (searchWord) {
            const searchConditions = [
                db.where(db.fn("lower", db.col("project_code")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("package")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("value")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("description")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("employee_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("postition")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("pagu")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            ]
            search.where[Op.and].push({
                [Op.or]: searchConditions
            });
        }

        let listStatusProject

        if (status == 'temp') {
            listStatusProject = await model.v_status_project_temp.findAndCountAll(search);
        } else if (status == 'act') {
            listStatusProject = await model.v_status_project.findAndCountAll(search);
        }

        if (listStatusProject.rows.length > 0) {
            for (let i = 0; i <= listStatusProject.rows.length - 1; i++) {
                listStatusProject.rows[i].dataValues.created_at = moment(listStatusProject.rows[i].dataValues.created_at, "YYYY-MM-DDTHH:mm:ss")
            }
            responseStatus.resOK(res, listStatusProject)
        } else {
            responseStatus.resNotFound(res, "Data Not Found")
        }
    } catch (error) {
        next(error)
    }
}
controller.getAllStatusProject = async (req, res, next) => {
    let { status, page, size, lang, searchWord, date } = req.body
    try {
        let getPagination = (page, size) => {
            const limit = size ? +size : 0;
            const offset = page ? 0 + (page - 1) * limit : 0;
            return { limit, offset };
        };

        let limit = getPagination(page, size).limit;
        let offset = getPagination(page, size).offset;

        let dataMarketing = [req.id_profile]
        let findMarketing = await model.structure_organ.findAll({
            where: {
                id_leader: req.id_profile
            }
        })

        if (findMarketing.length > 0) {
            findMarketing.map(data => {
                dataMarketing.push(data.id_profile)
            })
        }

        let search = {
            where: {
                [Op.and]: [
                    //{ id_marketing: { [Op.in]: dataMarketing } }
                ],
            }
        }

        if (date) {
            date = new Date(date);
            const formattedDate = date.toISOString().slice(0, 10);
            console.log(formattedDate, "==========")
            search.where[Op.and].push(
                Sequelize.literal(`DATE(updated_at) = '${formattedDate}'`)
            );
        }

        if (searchWord) {
            let globalSearch = {
                [Op.or]: []
            }
            globalSearch[Op.or].push(
                Sequelize.literal(`(LOWER(project_code) LIKE '%${searchWord.toLowerCase()}%' OR LOWER(package) LIKE '%${searchWord.toLowerCase()}%' OR LOWER(value) LIKE '%${searchWord.toLowerCase()}%' OR LOWER(description) LIKE '%${searchWord.toLowerCase()}%' OR LOWER(marketing_name) LIKE '%${searchWord.toLowerCase()}%' OR LOWER(contract_value) LIKE '%${searchWord.toLowerCase()}%')`)
            );
            search.where[Op.and].push(globalSearch);
        }

        if (status) {
            search.where[Op.and].push(Sequelize.literal(`flag = ${status}`));
        }
        if (limit != 0 && offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        let dataAllStatus = await model.v_all_status_project.findAndCountAll(search)

        if (dataAllStatus.rows.length > 0) {
            for (let i = 0; i <= dataAllStatus.rows.length - 1; i++) {
                console.log(dataAllStatus.rows[i])
                dataAllStatus.rows[i].dataValues.created_at = moment(dataAllStatus.rows[i].dataValues.created_at).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
                dataAllStatus.rows[i].dataValues.updated_at = moment(dataAllStatus.rows[i].dataValues.updated_at).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
            }
            responseStatus.resOK(res, dataAllStatus)
        } else {
            responseStatus.resNotFound(res, "Data Not Found")
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}
controller.getOneStatusProject = async (req, res, next) => {
    let { id_status_project } = req.query
    let { status } = req.body
    try {

        let dataStatusProject
        if (status == 'temp') {
            dataStatusProject = await model.v_status_project_temp.findOne({
                where: {
                    id_status_project_temp: id_status_project
                }
            })
        } else if (status == 'act') {
            dataStatusProject = await model.v_status_project.findOne({
                where: {
                    id_status_project: id_status_project
                }
            })
        }

        if (dataStatusProject) {
            responseStatus.resOK(res, dataStatusProject)
        } else {
            responseStatus.resNotFound(res, "Data Not Found")
        }
    } catch (error) {
        next(error)
    }
}
controller.getProgressDetail = async (req, res, next) => {
    let { id_project } = req.query
    try {
        let dataProgress = await model.v_all_status_project.findAll({
            attributes: ['description', 'updated_at', 'value', 'marketing_name', 'coordinator_name'],
            where: { id_project: id_project },
            order: [['updated_at', 'DESC']]
        })

        if (dataProgress) {
            for (let i = 0; i <= dataProgress.length - 1; i++) {
                console.log(dataProgress[i])
                dataProgress[i].dataValues.created_at = moment(dataProgress[i].dataValues.created_at).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
                dataProgress[i].dataValues.updated_at = moment(dataProgress[i].dataValues.updated_at).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
            }
            responseStatus.resOK(res, dataProgress)
        } else {
            responseStatus.resNotFound(res, "Data Not Found")
        }
    } catch (error) {
        next(error)
    }
}
controller.checkApproveStatusProject = async (req, res, next) => {
    let { id_project, project_code } = req.query
    try {
        let findDataCheck = await model.v_status_project_temp.findOne({
            where: {
                [Op.and]: [
                    { id_project: id_project },
                    { project_code: project_code }
                ]
            }
        })
        if (findDataCheck) {
            responseStatus.resOK(res, {
                status: 1,
                msg: "Cannot add new progress before approved the last progress"
            })
        } else {
            responseStatus.resOK(res, {
                status: 0,
                msg: "OK"
            })
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}

// daily_activity
controller.addDailyActivity = async (req, res, next) => {
    let { data } = req.body
    let checkDocument = await model.mst_document.findOne({
        where: {
            document_name: "daily_activity" // harus diinput dulu di master
        }
    })
    try { // sehari gak boleh lebih dri 1 kali
        let dataCheck
        console.log(new Date(), "============")
        const today = new Date();
        const formattedDate = today.toISOString().slice(0, 10);
        //let nowDate =
        // if (checkDocument.approval === true) {
        //     dataCheck = await model.daily_activity_temp.findOne({
        //         where: Sequelize.literal(`DATE(activity_date) = '${formattedDate}' AND id_profile = ${req.id_profile}`)
        //     })
        // } else {
        //     dataCheck = await model.daily_activity.findOne({
        //         where: Sequelize.literal(`DATE(activity_date) = '${formattedDate}' AND id_profile = ${req.id_profile}`)
        //     })
        // }
        // console.log(dataCheck)
        // if (dataCheck) throw new ErrorResponse("Data is already exist!", 400)
        if (data) {
            let dataReceiver = []
            data = typeof data == "string" ? JSON.parse(data) : data
            if (checkDocument) {
                const structureOrgan = "CALL public.insert_daily_activity(:p_id_profile,:p_activity_date,:p_activity,:p_lat,:p_long,:p_username,:p_datetime,:p_condition,:p_address)";

                const parameter = {
                    p_id_profile: req.id_profile,
                    p_activity_date: new Date(),
                    p_activity: data.activity,
                    p_lat: data.lat.toString(),
                    p_long: data.long.toString(),
                    p_username: req.username,
                    p_datetime: new Date(),
                    p_condition: checkDocument.approval,
                    p_address: data.address
                }
                db.query(structureOrgan, {
                    replacements: parameter,
                    type: Sequelize.QueryTypes.RAW, // Use RAW query type for stored procedures
                })
                    .then(async (results) => {
                        console.log('Procedure executed successfully:', results);
                        // notif
                        let dataTempRec = [req.id_profile]
                        let dataReceiver = []
                        if (dataTempRec.length > 0) {
                            let truncatedString = data.activity.length > 40 ? data.activity.substring(0, 40) + '...' : data.activity;
                            let dataReceiverFind = await getReceiver({
                                receiver: dataTempRec,
                                parent: 'Daily Activity',
                                header: 'Daily Activity',
                                credential: truncatedString // activity 40 character
                            })
                            console.log(dataReceiverFind, '++++')
                            if (dataReceiverFind.length > 0) {
                                dataReceiver = dataReceiver.concat(dataReceiverFind)
                            }
                        }
                        if (dataReceiver.length > 0) {
                            console.log("masuk sini!!!")
                            for (let i = 0; i < dataReceiver.length; i++) {
                                let dataNotif = await payloadToNotif(dataReceiver[i].header, dataReceiver[i].credential, dataReceiver[i].receiver, req.id_profile, `http://localhost:3000/master/activityMarketing`)
                                let addToNotif = await addToTableHistoryNotif(dataNotif);
                                console.log(addToNotif, '+++++++++')
                                let pushNotifData = await pushNotif(dataNotif);
                                console.log(pushNotifData, "------------")
                            }
                        }

                        return responseStatus.resCreated(res, parameter)
                    })
                    .catch((error) => {
                        console.log(error, "-")
                        return responseStatus.resInternalServerError(res, error);
                    });
            } else {
                responseStatus.resNotAcceptable(res, "Document transaction not found, please insert document first")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        next(error)
    }
}
controller.getAllDailyActivity = async (req, res, next) => {
    let { status, page, size, lang, searchWord, id_profile, date } = req.body
    try {
        let getPagination = (page, size) => {
            const limit = size ? +size : 0;
            const offset = page ? 0 + (page - 1) * limit : 0;
            return { limit, offset };
        };

        let limit = getPagination(page, size).limit;

        let offset = getPagination(page, size).offset;

        console.log(limit, offset)

        let search = {
            // limit,
            // offset,
            where: {
                // [Op.or]: [
                // ]
            },
            order: [['activity_date', 'desc']],
            logging: console.log
        }

        if (limit !== 0 || offset !== 0) {
            search.limit = limit
            search.offset = offset
        }

        if (date) {
            search.where[Op.or] = []
            date = new Date(date);
            const formattedDate = date.toISOString().slice(0, 10);
            console.log(formattedDate, "==========")
            search.where[Op.or].push(
                Sequelize.literal(`DATE(updated_at) = '${formattedDate}'`)
            );
        }

        if (searchWord) {
            search.where[Op.or] = []
            //const formattedDate = today.toISOString().slice(0, 10);
            search.where[Op.or].push(
                // db.where(db.fn('DATE_FORMAT', db.col('activity_date'), '%Y-%m-%d'), {
                //     [Op.like]: `%${searchWord.toLowerCase()}%`,
                // }),
                db.where(db.fn("lower", db.col("activity")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("employee_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("email")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                })
            )
        }

        if (status == 'temp') {
            search.where[Op.and] = []
            search.where[Op.and].push({ flag: 'temp' })
            //listDailyActivity = await model.v_daily_activity_temp.findAndCountAll(search);
        } else if (status == 'act') {
            search.where[Op.and] = []
            search.where[Op.and].push({ flag: 'actual' })
            //listDailyActivity = await model.v_daily_activity.findAndCountAll(search);
        }

        if (id_profile && !(req.role_level == 'Direktur' || req.role_level == 'Superadmin' || req.role_level == 'Admin')) {
            search.where[Op.and] = []
            search.where[Op.and].push({ id_profile: id_profile })
        }

        let listDailyActivity = await model.v_all_daily_activity.findAndCountAll(search);
        if (listDailyActivity?.rows?.length > 0) {
            listDailyActivity.rows.forEach((x) => {
                // Assuming activity.activity_date is a Date object
                x.dataValues.activity_date = moment(x.dataValues.activity_date).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
                x.dataValues.created_at = moment(x.dataValues.created_at).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
                x.dataValues.updated_at = moment(x.dataValues.updated_at).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
            });

            responseStatus.resOK(res, listDailyActivity)
        } else {
            responseStatus.resNotFound(res, "Data Not Found")
        }
    } catch (error) {
        next(error)
    }
}
controller.getAllDailyActivityMobile = async (req, res, next) => {
    let { status, page, size, lang, searchWord, id_profile, date } = req.body
    try {
        console.log("req role level", req.role_level)
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
            order: [['activity_date', 'desc']],
            logging: console.log
        }

        if (limit != 0 && offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (date || searchWord) {
            search.where[Op.or] = []
        }
        if (date) {
            //search.where[Op.or] = []
            date = new Date(date);
            const formattedDate = date.toISOString().slice(0, 10);
            console.log(formattedDate, "==========")
            search.where[Op.or].push(
                Sequelize.literal(`DATE(updated_at) = '${formattedDate}'`)
            );
        }

        if (searchWord) {
            //search.where[Op.or] = []
            search.where[Op.or].push(
                db.where(db.fn("lower", db.col("activity_date")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("activity")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("employee_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("email")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                })
            )
        }

        let listDailyActivity

        if (status == 'temp') {
            search.where[Op.and] = []
            search.where[Op.and].push({ flag: 'temp' })
        } else if (status == 'act') {
            search.where[Op.and] = []
            search.where[Op.and].push({ flag: 'actual' })
        }

        console.log("req.role_level", req.role_level)
        if (id_profile && !(req.role_level == 'Direktur' || req.role_level == 'Superadmin' || req.role_level == 'Admin')) {
            search.where[Op.and] = []
            search.where[Op.and].push({ id_profile: id_profile })
        }

        listDailyActivity = await model.v_all_daily_activity.findAndCountAll(search);
        if (listDailyActivity?.rows?.length > 0) {
            console.log("list daily activity", listDailyActivity)
            for (let i = 0; i <= listDailyActivity.rows.length - 1; i++) {
                listDailyActivity.rows[i].activity_date = moment(listDailyActivity.rows[i].activity_date).format("YYYY-MM-DDTHH:mm:ss") + "Z"
                listDailyActivity.rows[i].created_at = moment(listDailyActivity.rows[i].created_at).format("YYYY-MM-DDTHH:mm:ss") + "Z"
                listDailyActivity.rows[i].updated_at = moment(listDailyActivity.rows[i].updated_at).format("YYYY-MM-DDTHH:mm:ss") + "Z"
            }
            responseStatus.resOK(res, listDailyActivity)
        } else {
            responseStatus.resNotFound(res, "Data Not Found")
        }
    } catch (error) {
        next(error)
    }
}
controller.getOneDailyActivity = async (req, res, next) => {
    let { id_daily_activity } = req.query
    let { status } = req.body
    try {

        let dataDailyActivity
        if (status == 'temp') {
            dataDailyActivity = await model.v_daily_activity_temp.findOne({
                where: {
                    id_daily_activity_temp: id_daily_activity
                }
            })
        } else if (status == 'act') {
            dataDailyActivity = await model.v_daily_activity.findOne({
                where: {
                    id_daily_activity: id_daily_activity
                }
            })
        }

        if (dataDailyActivity) {
            dataDailyActivity.dataValues.activity_date = moment(dataDailyActivity.activity_date).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
            dataDailyActivity.dataValues.created_at = moment(dataDailyActivity.created_at).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
            dataDailyActivity.dataValues.updated_at = moment(dataDailyActivity.updated_at).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"

            responseStatus.resOK(res, dataDailyActivity)
        } else {
            responseStatus.resNotFound(res, "Data Not Found")
        }
    } catch (error) {
        next(error)
    }
}
controller.approvalDailyActivity = async (req, res, next) => {
    let { id } = req.body
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    try {
        if (id) {
            id = typeof id == "string" ? JSON.parse(id) : id
            if (id.length > 0) {
                let dataReceiver = []
                let dataDailyApprove = await model.daily_activity_temp.findAll({
                    where: { id_daily_activity_temp: id }
                })
                let dataInsertApprove = []

                for (let i = 0; i < dataDailyApprove.length; i++) {
                    let dataTempRec = [dataDailyApprove[i].id_profile]

                    console.log("index", index)
                    dataInsertApprove.push({
                        activity_date: dataDailyApprove[i].activity_date,
                        lat: dataDailyApprove[i].lat.toString(),
                        long: dataDailyApprove[i].long.toString(),
                        activity: dataDailyApprove[i].activity,
                        id_profile: dataDailyApprove[i].id_profile,
                        created_at: dataDailyApprove[i].created_at,
                        created_by: dataDailyApprove[i].created_by,
                        updated_at: new Date(),
                        updated_by: req.username,
                        address: dataDailyApprove[i].address,
                        approval_by: req.username,
                        approval_date: new Date(),
                        status_approval: "approved"
                    })

                    if (dataTempRec.length > 0) {
                        let truncatedString = dataDailyApprove[i].activity.length > 40 ? dataDailyApprove[i].activity.substring(0, 40) + '...' : dataDailyApprove[i].activity;
                        let dataReceiverFind = await getReceiver({
                            receiver: dataTempRec,
                            parent: 'Daily Activity',
                            header: 'Daily Activity',
                            credential: `Approved-${truncatedString}` // activity 40 character
                        })
                        console.log(dataReceiverFind, '++++')
                        if (dataReceiverFind.length > 0) {
                            dataReceiver = dataReceiver.concat(dataReceiverFind)
                        }
                    }
                }

                // dataDailyApprove.map((data, index) => {
                //     let dataTempRec = [data.id_profile]

                //     console.log("index", index)
                //     dataInsertApprove.push({
                //         activity_date: data.activity_date,
                //         lat: data.lat.toString(),
                //         long: data.long.toString(),
                //         activity: data.activity,
                //         id_profile: data.id_profile,
                //         created_at: data.created_at,
                //         created_by: data.created_by,
                //         updated_at: new Date(),
                //         updated_by: req.username,
                //         address: data.address,
                //         approval_by: req.username,
                //         approval_date: new Date(),
                //         status_approval: "approved"
                //     })
                // })

                console.log("data insert approve", dataInsertApprove)

                let insertApprove = await model.daily_activity.bulkCreate(dataInsertApprove, { transaction: t })
                let deleteTemp = await model.daily_activity_temp.destroy({
                    where: { id_daily_activity_temp: id },
                    transaction: t
                })
                await t.commit()

                if (dataReceiver.length > 0) {
                    console.log("masuk sini!!!")
                    for (let i = 0; i < dataReceiver.length; i++) {
                        let dataNotif = await payloadToNotif(dataReceiver[i].header, dataReceiver[i].credential, dataReceiver[i].receiver, req.id_profile, `http://localhost:3000/master/activityMarketing`)
                        let addToNotif = await addToTableHistoryNotif(dataNotif);
                        console.log(addToNotif, '+++++++++')
                        let pushNotifData = await pushNotif(dataNotif);
                        console.log(pushNotifData, "------------")
                    }
                }

                return responseStatus.resOK(res, "Data success approved!")
            } else {
                responseStatus.resBadRequest(res, "Input data is empty")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        console.log(error)
        if (t && !t.finished) await t.rollback();
        next(error)
    }
}
controller.rejectDailyActivity = async (req, res, next) => {
    let { id } = req.body
    try {
        if (id) {
            id = typeof id == "string" ? JSON.parse(id) : id
            if (id.length > 0) {
                let dataReceiver = []
                let dataDailyRejected = await model.daily_activity_temp.findAll({
                    where: { id_daily_activity_temp: id }
                })
                //let dataUpdateRejected = []

                for (let i = 0; i < dataDailyRejected.length; i++) {
                    let dataTempRec = [dataDailyRejected[i].id_profile]

                    console.log("index", index)
                    let dataUpdate = {
                        activity_date: dataDailyRejected[i].activity_date,
                        lat: dataDailyRejected[i].lat.toString(),
                        long: dataDailyRejected[i].long.toString(),
                        activity: dataDailyRejected[i].activity,
                        id_profile: dataDailyRejected[i].id_profile,
                        updated_at: new Date(),
                        updated_by: req.username,
                        address: dataDailyRejected[i].address,
                        approval_by: req.username,
                        approval_date: new Date(),
                        status_approval: "rejected"
                    }

                    if (dataTempRec.length > 0) {
                        let truncatedString = dataDailyRejected[i].activity.length > 40 ? dataDailyRejected[i].activity.substring(0, 40) + '...' : dataDailyRejected[i].activity;
                        let dataReceiverFind = await getReceiver({
                            receiver: dataTempRec,
                            parent: 'Daily Activity',
                            header: 'Daily Activity',
                            credential: `Rejected-${truncatedString}` // activity 40 character
                        })
                        console.log(dataReceiverFind, '++++')
                        if (dataReceiverFind.length > 0) {
                            dataReceiver = dataReceiver.concat(dataReceiverFind)
                        }
                    }
                    let updateDailyReject = await model.daily_activity_temp.update(dataUpdate, {
                        where: {
                            id_daily_activity_temp: dataDailyRejected[i].id_daily_activity_temp
                        }
                    })

                }
                // let dataUpdate = {
                //     updated_at: new Date(),
                //     updated_by: req.username,
                //     status_approval: 'rejected',
                //     approval_by: req.username,
                //     approval_date: new Date()
                // }
                if (dataReceiver.length > 0) {
                    console.log("masuk sini!!!")
                    for (let i = 0; i < dataReceiver.length; i++) {
                        let dataNotif = await payloadToNotif(dataReceiver[i].header, dataReceiver[i].credential, dataReceiver[i].receiver, req.id_profile, `http://localhost:3000/master/activityMarketing`)
                        let addToNotif = await addToTableHistoryNotif(dataNotif);
                        console.log(addToNotif, '+++++++++')
                        let pushNotifData = await pushNotif(dataNotif);
                        console.log(pushNotifData, "------------")
                    }
                }
                responseStatus.resCreated(res, "Updated")
            } else {
                responseStatus.resBadRequest(res, "Input data is empty")
            }
        } else {

            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        next(error)
    }
}
controller.updateDailyActivity = async (req, res, next) => {
    let { id } = req.query
    let { data } = req.body
    try {
        //data.map(x =>{
        data.updated_at = new Date()
        data.updated_by = req.username,
            data.status_approval = null,
            data.approval_date = null,
            data.approval_by = null
        //})
        let updateDaily = await model.daily_activity_temp.update(data, {
            where: {
                id_daily_activity_temp: id
            }
        })

        let dataTempRec = [req.id_profile]
        let dataReceiver = []
        if (dataTempRec.length > 0) {
            let truncatedString = data.activity.length > 40 ? data.activity.substring(0, 40) + '...' : data.activity;
            let dataReceiverFind = await getReceiver({
                receiver: dataTempRec,
                parent: 'Daily Activity',
                header: 'Daily Activity',
                credential: truncatedString // activity 40 character
            })
            console.log(dataReceiverFind, '++++')
            if (dataReceiverFind.length > 0) {
                dataReceiver = dataReceiver.concat(dataReceiverFind)
            }
        }
        if (dataReceiver.length > 0) {
            console.log("masuk sini!!!")
            for (let i = 0; i < dataReceiver.length; i++) {
                let dataNotif = await payloadToNotif(dataReceiver[i].header, dataReceiver[i].credential, dataReceiver[i].receiver, req.id_profile, `http://localhost:3000/master/activityMarketing`)
                let addToNotif = await addToTableHistoryNotif(dataNotif);
                console.log(addToNotif, '+++++++++')
                let pushNotifData = await pushNotif(dataNotif);
                console.log(pushNotifData, "------------")
            }
        }
        responseStatus.resCreated(res, updateDaily)
    } catch (error) {
        next(error)
    }
}
controller.checkProjectCode = async (req, res, next) => {
    let { projectCode } = req.body
    try {
        if (!projectCode || projectCode.length < 1) {
            responseStatus.resBadRequest(res, "Input data is empty")
        }

        let project = await model.v_all_project.findAll({
            where: { project_code: projectCode }
        })

        if (!project) {
            return responseStatus.resNotFound(res, "Data not found!")
        }

        return responseStatus.resOK(res, project)

    } catch (error) {
        if (t && !t.finished) await t.rollback();
        next(error)
    }
}

//Mobile
controller.findDataProjectTempPCMobile = async (req, res, next) => {
    let data = req.body
    try {
        if (data) {
            data = data = typeof data == "string" ? JSON.parse(data) : data
            const result = await model.detail_file_project_temp.findAll({
                where: {
                    project_code: { [Op.in]: data } // project code
                }
            });
            responseStatus.resOK(res, result)
        } else {
            responseStatus.resBadRequest(res, "Input is Empty")
        }
    } catch (error) {
        next(error)
    }
}
controller.addProjectToTempBulkMobile = async (req, res, next) => {
    let data = req.body
    try {
        if (data) {
            data = data = typeof data == "string" ? JSON.parse(data) : data
            let result = await model.detail_file_project_temp.bulkCreate(data);
            responseStatus.resCreated(res, result)
        } else {
            responseStatus.resBadRequest(res, "Input is Empty")
        }
    } catch (error) {
        return error;
    }
}

controller.addProjectToActualBulkMobile = async (req, res, next) => {
    let data = req.body
    console.log(data)
    try {
        if (data) {
            data = data = typeof data == "string" ? JSON.parse(data) : data
            let result = await model.detail_file_project.bulkCreate(data);
            //console.log(result)
            responseStatus.resCreated(res, result)
        } else {
            responseStatus.resBadRequest(res, "Input is Empty")
        }
    } catch (error) {
        console.log(error)
        return error;
    }
}

controller.addToHistoryProjectBulkMobile = async (req, res, next) => {
    let data = req.body
    try {
        if (data) {
            data = data = typeof data == "string" ? JSON.parse(data) : data
            let result = await model.detail_file_project_history.bulkCreate(data)
            responseStatus.resCreated(res, result)
        } else {
            responseStatus.resBadRequest(res, "Input is Empty")
        }
    } catch (error) {
        next(error)
    }
}

controller.addProgressBulkMobile = async (req, res, next) => {
    let data = req.body
    try {
        if (data) {
            data = data = typeof data == "string" ? JSON.parse(data) : data
            let result = await model.status_project.bulkCreate(data);
            responseStatus.resCreated(res, result)
        } else {
            responseStatus.resBadRequest(res, "Input is Empty")
        }
    } catch (error) {
        next(error)
    }
}

controller.addProgressBulkTempMobile = async (req, res, next) => {
    let data = req.body
    try {
        if (data) {
            data = data = typeof data == "string" ? JSON.parse(data) : data
            let result = await model.status_project_temp.bulkCreate(data);
            responseStatus.resCreated(res, result)
        } else {
            responseStatus.resBadRequest(res, "Input is Empty")
        }
    } catch (error) {
        next(error)
    }
}

//controller.findDataStatus = async

// controller.deleteProjectTemp = async (req, res, next) => {
//     let { data } = req.body
//     try {
//         if (data) {
//             data = data = typeof data == "string" ? JSON.parse(data) : data
//             let result = await model.detail_file_project_temp.destroy({
//                 where: {
//                     id_detail_file_project_temp: { [Op.in]: data }
//                 }
//             })
//             responseStatus.resOK(res, result)
//         } else {
//             responseStatus.resBadRequest(res, "Input is Empty")
//         }
//     } catch (error) {
//         return error;
//     }
// }

controller.createProjectMobile = async (req, res, next) => {
    let { data } = req.body
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    /* 
    data = {
        project_code = [],
        data = [
            {
                    id_marketing: 1,
                    project_code: 234,
                    project_data_source: "jhgghg",
                    status_approval: null,
                    approved_by: "system",
                    approved_date: new Date(),
                    id_keyword: findData[i].id_keyword,
                    input_date: findData[i].input_date,
                    package: findData[i].package,
                    pagu: findData[i].page,
                    id_procurement_type: findData[i].id_procurement_type,
                    //id_header_project: Sequelize.NUMBER,
                    method: findData[i].method,
                    choose_date: findData[i].choose_date,
                    klpd: findData[i].klpd,
                    work_unit: findData[i].work_unit,
                    id_location: findData[i].id_location,
                    fund_source: findData[i].fund_source,
                    created_at: findData[i].created_at,
                    created_by: findData[i].created_by,
                    updated_at: new Date(),
                    updated_by: req.username,
                    filename : findData[i].filename,
                    id_sub_dis: findData[i].id_sub_dis,
                    url: ,
                    unit_value: ,
                    type_item : ,
                    unit_set : ,
                    coordinator: ,
                    company: ,
                    source_document: ,
                }
        ]
    }
    */

    try {
        if (data) {
            data = typeof data == "string" ? JSON.parse(data) : data
            let checkDocument = await model.mst_document.findOne({
                where: {
                    document_name: "project" // harus diinput dulu di master
                }
            })
            let result
            if (data.data.length > 0) {
                if (checkDocument) {
                    let dataInputProgress = []
                    let allData = []
                    for (let j = 0; j < data.data.length; j++) {
                        let dataInput = {
                            id_marketing: data.data[j].id_marketing,
                            project_code: data.data[j].project_code,
                            project_data_source: data.data[j].project_data_source,
                            status_approval: checkDocument.approval === true ? null : "approved",
                            approved_by: checkDocument.approval === true ? null : "system",
                            approved_date: checkDocument.approval === true ? null : new Date(),
                            id_keyword: data.data[j].id_keyword,
                            input_date: data.data[j].input_date,
                            package: data.data[j].package,
                            pagu: data.data[j].pagu,
                            id_procurement_type: data.data[j].id_procurement_type,
                            method: data.data[j].method,
                            choose_date: data.data[j].choose_date,
                            klpd: data.data[j].klpd,
                            work_unit: data.data[j].work_unit,
                            id_location: data.data[j].id_location,
                            fund_source: data.data[j].fund_source,
                            created_at: new Date(),
                            created_by: req.username,
                            updated_at: new Date(),
                            updated_by: req.username,
                            filename: data.data[j].filename,
                            //id_sub_dis: data.data[j]?.id_sub_dis,
                            sub_dis: data.data[j].sub_dis,
                            url: data.data[j].url,
                            unit_value: data.data[j].unit_value,
                            type_item: data.data[j].type_item,
                            unit_set: data.data[j].unit_set,
                            coordinator: data.data[j].coordinator,
                            company: data.data[j].company,
                            source_document: data.data[j].source_document,
                            contract_value: data.data[j].contract_value,
                        }

                        if (checkDocument.approval === true) {
                            dataInput.id_progress = data.data[j].id_progress
                        }
                        allData.push(dataInput)
                    }
                    if (checkDocument.approval === true) { // maka cek temp dan masuk ke temp
                        let findDataTemp = await model.detail_file_project_temp.findAll({
                            where: {
                                project_code: { [Op.in]: data.project_code }
                            }
                        })
                        let createDataToTemp = await model.detail_file_project_temp.bulkCreate(allData, { transaction: t })
                        if (findDataTemp.length > 0) {
                            const idsToDelete = findDataTemp.map(item => item.id);
                            let deleteDataTemp = await model.detail_file_project_temp.destroy({
                                where: {
                                    id_detail_file_project_temp: { [Op.in]: idsToDelete }
                                }, transaction: t
                            })
                        }
                        result = createDataToTemp;
                    } else { // langsung check dan masuk ke actual data lama input ke history
                        let copied = await copyToHistoryProjectCode(data.project_code)
                        if (copied === true) {
                            let createDataToActual = await model.detail_file_project.bulkCreate(allData, { transaction: t })

                            let dataAddFixHistory = allData.map((item) => ({
                                ...item,
                                description: "approved automatically"
                            }));
                            let createToHistory = await model.detail_file_project_history.bulkCreate(dataAddFixHistory, { transaction: t })
                            result = createDataToActual;
                        } else {
                            throw new ErrorResponse("Failed To Copy or Delete", 400)
                        }
                    }
                    await t.commit()
                    responseStatus.resCreated(res, result);
                } else {
                    responseStatus.resNotAcceptable(res, "Document transaction not found, please insert document first")
                }
            } else {
                responseStatus.resBadRequest(res, "Input data is empty")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        next(error)
    }
}
controller.createProjectsMobile = async (req, res, next) => {
    let { data } = req.body
    /* 
    data = {
        project_code = [],
        data = [
            {
                    id_marketing: 1,
                    project_code: 234,
                    project_data_source: "jhgghg",
                    status_approval: null,
                    approved_by: "system",
                    approved_date: new Date(),
                    id_keyword: findData[i].id_keyword,
                    input_date: findData[i].input_date,
                    package: findData[i].package,
                    pagu: findData[i].page,
                    id_procurement_type: findData[i].id_procurement_type,
                    //id_header_project: Sequelize.NUMBER,
                    method: findData[i].method,
                    choose_date: findData[i].choose_date,
                    klpd: findData[i].klpd,
                    work_unit: findData[i].work_unit,
                    id_location: findData[i].id_location,
                    fund_source: findData[i].fund_source,
                    created_at: findData[i].created_at,
                    created_by: findData[i].created_by,
                    updated_at: new Date(),
                    updated_by: req.username,
                    filename : findData[i].filename,
                    id_sub_dis: findData[i].id_sub_dis,
                    url: ,
                    unit_value: ,
                    type_item : ,
                    unit_set : ,
                    coordinator: ,
                    company: ,
                    source_document: ,
                }
        ]
    }
    */
    try {
        if (data) {
            data = typeof data == "string" ? JSON.parse(data) : data
            let checkDocument = await model.mst_document.findOne({
                where: {
                    document_name: "project" // harus diinput dulu di master
                }
            })
            //checkDocument.approval = false;
            let result
            if (data.data.length > 0) {
                if (checkDocument) {
                    let dataInputProgress = []
                    let allData = []
                    for (let j = 0; j < data.data.length; j++) {
                        let dataInput = {
                            id_marketing: data.data[j].id_marketing,
                            project_code: data.data[j].project_code,
                            project_data_source: data.data[j].project_data_source,
                            status_approval: checkDocument.approval === true ? null : "approved",
                            approved_by: checkDocument.approval === true ? null : "system",
                            approved_date: checkDocument.approval === true ? null : new Date(),
                            id_keyword: data.data[j].id_keyword,
                            input_date: data.data[j].input_date,
                            package: data.data[j].package,
                            pagu: data.data[j].pagu,
                            id_procurement_type: data.data[j].id_procurement_type,
                            method: data.data[j].method,
                            choose_date: data.data[j].choose_date,
                            klpd: data.data[j].klpd,
                            work_unit: data.data[j].work_unit,
                            id_location: data.data[j].id_location,
                            fund_source: data.data[j].fund_source,
                            created_at: new Date(),
                            created_by: req.username,
                            updated_at: new Date(),
                            updated_by: req.username,
                            filename: data.data[j].filename,
                            //id_sub_dis: data.data[j]?.id_sub_dis,
                            sub_dis: data.data[j]?.sub_dis,
                            url: data.data[j].url,
                            unit_value: data.data[j].unit_value,
                            type_item: data.data[j].type_item,
                            unit_set: data.data[j].unit_set,
                            coordinator: data.data[j].coordinator,
                            company: data.data[j].company,
                            source_document: data.data[j].source_document,
                            contract_value: data.data[j].contract_value,
                        }

                        if (checkDocument.approval === true) {
                            dataInput.id_progress = data.data[j].id_progress
                        } else {
                            let findDataStatus = await model.mst_status.findOne({
                                where: {
                                    id_status: data.data[j].id_progress
                                }
                            })
                            if (findDataStatus) {
                                dataInputProgress.push({
                                    value: findDataStatus.value,
                                    id_status: data.data[j].id_progress,
                                    project_code: data.data[j].project_code
                                })
                            }
                        }
                        allData.push(dataInput)
                    }
                    if (checkDocument.approval === true) { // maka cek temp dan masuk ke temp
                        let config = {
                            headers: { authorization: `Bearer ${req.token}` }
                        };
                        let findDataTemp = await axios.post(
                            "http://localhost:8033/get-project-temp-pc",
                            data.project_code,
                            config
                        );
                        let createDataToTemp = await axios.post(
                            "http://localhost:8033/add-project-temp-api",
                            allData,
                            config
                        )

                        if (findDataTemp?.data?.responseResult.length > 0 && createDataToTemp?.data?.code == 1) {
                            const idsToDelete = findDataTemp.data?.result.map(item => item.id_detail_file_project_temp);
                            let dataId = JSON.stringify()
                            let deleteDataTemp = await axios.delete(
                                `http://localhost:8033/delete-project-temp-api?id=${dataId}`,
                                config
                            )
                        }
                        result = createDataToTemp?.data?.responseResult;
                    } else { // langsung check dan masuk ke actual data lama input ke history
                        let config = {
                            headers: { authorization: `Bearer ${req.token}` }
                        };
                        let copied = await copyToHistoryProjectCode(data.project_code, req.username)
                        if (copied === true) {
                            let createDataToActual = await axios.post(
                                "http://localhost:8033/add-project-act-api",
                                allData,
                                config
                            )
                            console.log("createdata", createDataToActual)
                            //let createDataToActual = await model.detail_file_project.bulkCreate(allData, { transaction: t })
                            let dataAddStatusProgress = []
                            if (createDataToActual?.data?.code == 1) {
                                console.log("masuk sini");
                                createDataToActual?.data?.responseResult.forEach(item1 => {
                                    console.log(item1, "=======")
                                    dataInputProgress.forEach(item2 => {
                                        if (item1.project_code === item2.project_code) {
                                            dataAddStatusProgress.push({
                                                id_project: item1.id_detail_file_project,
                                                id_status: item2.id_status,
                                                description: "upload automaticlly",
                                                created_at: new Date(),
                                                created_by: req.username,
                                                updated_at: new Date(),
                                                updated_by: req.username,
                                                value: item2.value
                                            })
                                        }
                                    });
                                });

                                let uploadProgress = await axios.post(
                                    "http://localhost:8033/add-progress-actual-api",
                                    dataAddStatusProgress,
                                    config
                                )
                                let dataAddFixHistory = allData.map((item) => ({
                                    ...item,
                                    description: "approved automatically"
                                }));

                                let createToHistory = await axios.post(
                                    "http://localhost:8033/add-project-history-api",
                                    dataAddFixHistory,
                                    config
                                )
                                result = createDataToActual?.data?.responseResult;
                            }

                            // let dataAddFixHistory = allData.map((item) => ({
                            //     ...item,
                            //     description: "approved automatically"
                            // }));
                            // let createToHistory = await model.detail_file_project_history.bulkCreate(dataAddFixHistory, { transaction: t })
                            // result = createDataToActual;
                        } else {
                            throw new ErrorResponse("Failed To Copy or Delete", 400)
                        }
                    }
                    responseStatus.resCreated(res, result);
                } else {
                    responseStatus.resNotAcceptable(res, "Document transaction not found, please insert document first")
                }
            } else {
                responseStatus.resBadRequest(res, "Input data is empty")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.deleteProjectTempMobile = async (req, res, next) => {
    let { id } = req.query
    try {
        if (id) {
            id = typeof id == "string" ? JSON.parse(id) : id
            let result
            if (id.length > 0) {
                let deleteDataTemp = await model.detail_file_project_temp.destroy({
                    where: {
                        id_detail_file_project_temp: { [Op.in]: id }
                    }
                })
                result = deleteDataTemp;
                responseStatus.resCreated(res, result);
            } else {
                responseStatus.resBadRequest(res, "id project is empty")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        //if (t && !t.finished) await t.rollback();
        next(error)
    }
}
controller.deleteProjectActualMobile = async (req, res, next) => {
    let { id } = req.query
    try {
        if (id) {
            id = typeof id == "string" ? JSON.parse(id) : id
            let findData = await model.detail_file_project.findAll({
                where: {
                    id_detail_file_project: { [Op.in]: id }
                }
            })
            if (findData.length > 0) {
                let dataTemp = [];
                //let idData = [];
                for (let i = 0; i < findData.length; i++) {
                    let dataProject = {
                        id_marketing: findData[i].id_marketing,
                        project_code: findData[i].project_code,
                        project_data_source: findData[i].project_data_source,
                        status_approval: findData[i].project_data_source,
                        approved_by: findData[i].approved_by,
                        approved_date: findData[i].approved_date,
                        id_keyword: findData[i].id_keyword,
                        input_date: findData[i].input_date,
                        package: findData[i].package,
                        url: findData[i].url,
                        pagu: findData[i].page,
                        id_procurement_type: findData[i].id_procurement_type,
                        //id_header_project: Sequelize.NUMBER,
                        created_at: findData[i].created_at,
                        created_by: findData[i].created_by,
                        updated_at: new Date(),
                        updated_by: req.username,
                        filename: findData[i].filename,
                        //id_sub_dis: findData[i].id_sub_dis,
                        sub_dis: findData[i].sub_dis,
                        url: findData[i].url,
                        unit_value: findData[i].unit_value,
                        type_item: findData[i].type_item,
                        unit_set: findData[i].unit_set,
                        coordinator: findData[i].coordinator,
                        company: findData[i].company,
                        source_document: findData[i].source_document,
                        contract_value: findData[i].contract_value,
                    }
                    //idData.push(findData[i].id_detail_file_poject)
                    dataTemp.push(dataProject);
                }
                let inputdataHistory = await model.detail_file_project_history.bulkCreate(dataTemp, { transaction: t });
                let deleteData = await model.detail_file_project.destroy({
                    where: {
                        id_detail_file_project: { [Op.in]: data.idProject }
                    }, transaction: t
                })
                result = deleteData;
                responseStatus.resCreated(res, result);
            } else {
                responseStatus.resBadRequest(res, "id project is empty")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        next(error)
    }
}

// controller.deleteProject = async (req, res, next) => {
//     let { data } = req.body

// const t = await db.transaction({
//     autoCommitTransactionalOFF: true,
// });

//     /*
//     data = {
//         "category" : "actual" / "temp",
//         "idProject" : [12,13]
//     }
//     */
//     try {
//         if (data) {
//             data = typeof data == "string" ? JSON.parse(data) : data
//             let result
//             if (data.idProject.length > 0) {
//                 if (data.category == "temp") {
//                     let deleteDataTemp = await model.detail_file_project_temp.destroy({
//                         where: {
//                             id_detail_file_project_temp: { [Op.in]: data.idProject }
//                         }, transaction: t
//                     })
//                     result = deleteDataTemp;
//                 } else {
//                     let findData = await model.detail_file_project.findAll({
//                         where: {
//                             id_detail_file_project: { [Op.in]: data.idProject }
//                         }
//                     })
//                     if (findData.length > 0) {
//                         let dataTemp = [];
//                         //let idData = [];
//                         for (let i = 0; i < findData.length; i++) {
//                             let dataProject = {
//                                 id_marketing: findData[i].id_marketing,
//                                 project_code: findData[i].project_code,
//                                 project_data_source: findData[i].project_data_source,
//                                 status_approval: findData[i].project_data_source,
//                                 approved_by: findData[i].approved_by,
//                                 approved_date: findData[i].approved_date,
//                                 id_keyword: findData[i].id_keyword,
//                                 input_date: findData[i].input_date,
//                                 package: findData[i].package,
//                                 url: findData[i].url,
//                                 pagu: findData[i].page,
//                                 id_procurement_type: findData[i].id_procurement_type,
//                                 //id_header_project: Sequelize.NUMBER,
//                                 created_at: findData[i].created_at,
//                                 created_by: findData[i].created_by,
//                                 updated_at: new Date(),
//                                 updated_by: req.username,
//                                 filename: findData[i].filename,
//                                 id_sub_dis: findData[i].id_sub_dis,
//                                 url: findData[i].url,
//                                 unit_value: findData[i].unit_value,
//                                 type_item: findData[i].type_item,
//                                 unit_set: findData[i].unit_set,
//                                 coordinator: findData[i].coordinator,
//                                 company: findData[i].company
//                             }
//                             //idData.push(findData[i].id_detail_file_poject)
//                             dataTemp.push(dataProject);
//                         }
//                         let inputdataHistory = await model.detail_file_project_history.bulkCreate(dataTemp, { transaction: t });
//                         let deleteData = await model.detail_file_project.destroy({
//                             where: {
//                                 id_detail_file_project: { [Op.in]: data.idProject }
//                             }, transaction: t
//                         })
//                         result = deleteData;
//                     }
//                 }
//                 await t.commit()
//                 responseStatus.resCreated(res, result);
//             } else {
//                 responseStatus.resBadRequest(res, "id project is empty")
//             }
//         } else {
//             responseStatus.resBadRequest(res, "Input data is empty")
//         }
//     } catch (error) {
//         if (t && !t.finished) await t.rollback();
//         next(error)
//     }
// }

controller.deleteProjectMobile = async (req, res, next) => {
    let { data } = req.body
    /*
    data = [{
        "category" : "actual" / "temp",
        "idProject" : [12,13]
    }]
    */
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    try {
        if (data) {
            data = data = typeof data == "string" ? JSON.parse(data) : data
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    if (data[i].category === "actual" || data[i].category === "approved") {
                        let findData = await model.detail_file_project.findAll({
                            where: {
                                id_detail_file_project: { [Op.in]: data[i].idProject }
                            }
                        })
                        if (findData.length > 0) {
                            let dataTemp = [];
                            for (let j = 0; j < findData.length; j++) {
                                let dataProject = {
                                    id_marketing: findData[j].id_marketing,
                                    project_code: findData[j].project_code,
                                    project_data_source: findData[j].project_data_source,
                                    status_approval: findData[j].project_data_source,
                                    approved_by: findData[j].approved_by,
                                    approved_date: findData[j].approved_date,
                                    id_keyword: findData[j].id_keyword,
                                    input_date: findData[j].input_date,
                                    package: findData[j].package,
                                    url: findData[j].url,
                                    pagu: findData[j].page,
                                    id_procurement_type: findData[j].id_procurement_type,
                                    //id_header_project: Sequelize.NUMBER,
                                    created_at: findData[j].created_at,
                                    created_by: findData[j].created_by,
                                    updated_at: new Date(),
                                    updated_by: req.username,
                                    filename: findData[j].filename,
                                    //id_sub_dis: findData[j].id_sub_dis,
                                    sub_dis: findData[j].sub_dis,
                                    url: findData[j].url,
                                    unit_value: findData[j].unit_value,
                                    type_item: findData[j].type_item,
                                    unit_set: findData[j].unit_set,
                                    coordinator: findData[j].coordinator,
                                    company: findData[j].company,
                                    source_document: findData[j].source_document,
                                    contract_value: findData[j].contract_value,
                                }
                                //idData.push(findData[i].id_detail_file_poject)
                                dataTemp.push(dataProject);
                            }
                            let inputdataHistory = await model.detail_file_project_history.bulkCreate(dataTemp, { transaction: t });
                            let deleteData = await model.detail_file_project.destroy({
                                where: {
                                    id_detail_file_project: { [Op.in]: data[i].idProject }
                                }, transaction: t
                            })
                        }
                    } else {
                        let deleteDataTemp = await model.detail_file_project_temp.destroy({
                            where: {
                                id_detail_file_project_temp: { [Op.in]: data[i].idProject }
                            }
                        })
                    }
                }
                responseStatus.resOK(res, "Data Deleted")
            } else {
                responseStatus.resBadRequest(res, 'input data is empty')
            }
        } else {
            responseStatus.resOK(res, "Success Deleted");
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}
controller.deleteProjectsMobile = async (req, res, next) => {
    let { data } = req.body
    /*
    data = [{
        "category" : "actual" / "temp",
        "idProject" : [12,13]
    }]
    */
    try {
        if (data) {
            data = data = typeof data == "string" ? JSON.parse(data) : data
            if (data.length > 0) {
                let config = {
                    headers: { authorization: `Bearer ${req.token}` }
                };
                for (let i = 0; i < data.length; i++) {
                    let dataId = JSON.stringify(data[i].idProject)
                    if (data[i].category === "actual" || data[i].category === "approved") {
                        let deleteDataTemp = await axios.delete(
                            `http://localhost:8033/delete-project-actual-api?id=${dataId}`,
                            config
                        )
                    } else {
                        let deleteDataTemp = await axios.delete(
                            `http://localhost:8033/delete-project-temp-api?id=${dataId}`,
                            config
                        )
                    }
                }
                responseStatus.resOK(res, "Success Deleted");
            } else {
                responseStatus.resBadRequest(res, 'input data is empty')
            }
        } else {
            responseStatus.resBadRequest(res, 'input data is empty')
        }
    } catch (error) {
        next(error)
    }
}
controller.getAllProjectNewMobile = async (req, res, next) => {
    let { status, page, size, lang, searchWord } = req.body
    try {
        let condition = ["approve", "not approve"]

        // if (!status || !condition.includes(status)) {
        //     throw new ErrorResponse("Please insert status (approve / not approve)", 400)
        // }

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

        let listProject

        search.where[Op.and] = []
        if (!(req.role_level == 'Direktur' || req.role_level == 'Superadmin' || req.role_level == 'Admin')) {
            search.where[Op.and].push({
                [Op.or]: [
                    { coordinator: req.id_profile },
                    { id_marketing: req.id_profile }
                ]
            })
        }

        if (status == "approve") {
            search.where[Op.and].push({ flag: 'actual' })
        } else if (status == "not approve") {
            search.where[Op.and].push({ flag: 'temp' })
        }

        listProject = await model.v_all_project.findAndCountAll(search)

        if (!listProject || listProject.rows.length < 1) {
            throw new ErrorResponse("Data not found!", 400)
        }

        for (let i = 0; i <= listProject.rows.length - 1; i++) {
            let lastProgress = await model.v_all_status_project.findOne({
                where: { id_project: listProject.rows[i].id_project },
                order: [['updated_at', 'desc']],
                limit: 1
            })
            if (lastProgress) {
                listProject.rows[i].dataValues.id_status = lastProgress.id_status
                listProject.rows[i].dataValues.progress_remarks = lastProgress.description
                listProject.rows[i].dataValues.progress_value = lastProgress.value
                listProject.rows[i].dataValues.progress_flag = lastProgress.flag
            }
        }

        responseStatus.resOK(res, listProject)
    } catch (error) {
        next(error)
        console.log(error)
    }
}
controller.getAllProjectMobile = async (req, res, next) => {
    let { status, page, size, lang, searchWord } = req.body
    try {
        let condition = ["approve", "not approve"]

        if (!status || !condition.includes(status)) {
            throw new ErrorResponse("Please insert status (approve / not approve)", 400)
        }

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
                db.where(db.fn("lower", db.col("project_code")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                // )
                // search.where[Op.or].push(
                db.where(db.fn("lower", db.col("package")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            )
        }

        let listProject

        if (status == "approve") {
            listProject = await model.v_project_detail.findAndCountAll(search)
            for (let i = 0; i <= listProject.rows.length - 1; i++) {
                let lastProgress = await model.v_all_status_project.findOne({
                    where: { id_project: listProject.rows[i].id_detail_file_project },
                    order: [['updated_at', 'desc']],
                    limit: 1
                })
                if (lastProgress) {
                    listProject.rows[i].dataValues.id_status = lastProgress.id_status
                    listProject.rows[i].dataValues.progress_remarks = lastProgress.description
                    listProject.rows[i].dataValues.progress_value = lastProgress.value
                    listProject.rows[i].dataValues.progress_flag = lastProgress.flag
                }
            }
        } else if (status == "not approve") {
            listProject = await model.v_project_temp_detail.findAndCountAll(search)
        }

        if (!listProject || listProject.rows.length < 1) {
            throw new ErrorResponse("Data not found!", 400)
        }

        responseStatus.resOK(res, listProject)
    } catch (error) {
        next(error)
        console.log(error)
    }
}
controller.getOneProjectMobile = async (req, res, next) => {
    let { status, id_project } = req.body
    try {
        if (!id_project) {
            throw new ErrorResponse("Please insert id_project!", 400)
        }

        let condition = ["actual", "temp"]

        if (!status || !condition.includes(status)) {
            throw new ErrorResponse("Please insert status (approve / not approve)", 400)
        }

        let project

        if (status == "actual") {
            project = await model.v_project_detail.findOne({
                where: { id_detail_file_project: id_project }
            })
        } else if (status == "temp") {
            project = await model.v_project_temp_detail.findOne({
                where: { id_detail_file_project_temp: id_project }
            })
        }

        if (!project) {
            throw new ErrorResponse("Data not found!", 400)
        }

        responseStatus.resOK(res, project)
    } catch (error) {
        next(error)
        console.log(error)
    }
}
controller.editDataProjectMobile = async (req, res, next) => {
    let { id_project } = req.query
    let { dataUpdate } = req.body

    try {
        let findData = await model.detail_file_project_temp.findOne({
            where: {
                id_detail_file_project_temp: id_project
            }
        })
        if (findData) {
            let findNewDataSame = await model.detail_file_project_temp.findOne({
                where: {
                    [Op.and]: [
                        { id_detail_file_project_temp: { [Op.not]: id_project } },
                        { project_code: dataUpdate.project_code }
                    ]
                }
            })
            if (findNewDataSame) {
                responseStatus.resNotAcceptable(res, "Data Project already exist")
            } else {
                let data = {
                    id_marketing: dataUpdate.id_marketing,
                    project_code: dataUpdate.project_code,
                    project_data_source: dataUpdate.project_data_source,
                    status_approval: dataUpdate.status_approval,
                    approved_by: dataUpdate.approved_by,
                    approved_date: dataUpdate.approved_date ? new Date(dataUpdate.approved_date) : null,
                    id_keyword: dataUpdate.id_keyword,
                    input_date: dataUpdate.input_date,
                    package: dataUpdate.package,
                    pagu: dataUpdate.pagu,
                    id_procurement_type: dataUpdate.id_procurement_type,
                    method: dataUpdate.method,
                    choose_date: dataUpdate.choose_date,
                    klpd: dataUpdate.klpd,
                    work_unit: dataUpdate.work_unit,
                    id_location: dataUpdate.id_location,
                    fund_source: dataUpdate.fund_source,
                    updated_at: new Date(),
                    updated_by: req.username,
                    filename: dataUpdate.filename,
                    //id_sub_dis: dataUpdate.id_sub_dis,
                    sub_dis: dataUpdate.sub_dis,
                    url: dataUpdate.url,
                    unit_value: dataUpdate.unit_value,
                    type_item: dataUpdate.type_item,
                    unit_set: dataUpdate.unit_set,
                    coordinator: dataUpdate.coordinator,
                    company: dataUpdate.company,
                    source_document: dataUpdate.source_document,
                    id_progress: dataUpdate.id_progress,
                    contract_value: dataUpdate.contract_value,
                }

                let updateData = await model.detail_file_project_temp.update(data, {
                    where: {
                        id_detail_file_project_temp: id_project
                    }
                })
                responseStatus.resCreated(res, updateData)
            }
        } else {
            responseStatus.resNotFound(res, "Data Project Not Found")
        }
    } catch (error) {
        next(error)
    }
}
controller.editProjectActualMobile = async (req, res, next) => {
    let { id_project } = req.query
    let { data } = req.body
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    /*
        {
                    id_marketing: 1, // bisa diedit
                    project_code: 234,
                    project_data_source: "jhgghg",
                    status_approval: null,
                    approved_by: "system",
                    approved_date: new Date(),
                    id_keyword: findData[i].id_keyword,
                    input_date: findData[i].input_date,
                    package: findData[i].package,
                    pagu: findData[i].page,
                    id_procurement_type: findData[i].id_procurement_type,
                    //id_header_project: Sequelize.NUMBER,
                    method: findData[i].method,
                    choose_date: findData[i].choose_date,
                    klpd: findData[i].klpd,
                    work_unit: findData[i].work_unit,
                    id_location: findData[i].id_location,
                    fund_source: findData[i].fund_source,
                    created_at: findData[i].created_at,
                    created_by: findData[i].created_by,
                    updated_at: new Date(),
                    updated_by: req.username,
                    filename : findData[i].filename,
                    id_sub_dis: findData[i].id_sub_dis, // bisa diedit
                    url: ,
                    unit_value: ,
                    type_item : ,
                    unit_set : ,
                    coordinator: , // bisa diedit
                    company: , // bisa diedit
                    source_document: ,
        }

    */
    try {
        let checkDocument = await model.mst_document.findOne({
            where: {
                document_name: "project" // harus diinput dulu di master
            }
        })

        if (data) {
            data = typeof data == "string" ? JSON.parse(data) : data
            let findDataExist = await model.detail_file_project.findOne({
                where: {
                    id_detail_file_project: id_project
                }
            })
            let dataHistory = {
                id_marketing: findDataExist.id_marketing,
                project_code: findDataExist.project_code,
                project_data_source: findDataExist.project_data_source,
                status_approval: findDataExist.project_data_source,
                approved_by: findDataExist.approved_by,
                approved_date: findDataExist.approved_date,
                id_keyword: findDataExist.id_keyword,
                input_date: findDataExist.input_date,
                package: findDataExist.package,
                pagu: findDataExist.page,
                id_procurement_type: findDataExist.id_procurement_type,
                //id_header_project: Sequelize.NUMBER,
                method: findDataExist.method,
                choose_date: findDataExist.choose_date,
                klpd: findDataExist.klpd,
                work_unit: findDataExist.work_unit,
                id_location: findDataExist.id_location,
                fund_source: findDataExist.fund_source,
                created_at: findDataExist.created_at,
                created_by: findDataExist.created_by,
                updated_at: new Date(),
                updated_by: req.username,
                filename: findDataExist.filename,
                //id_sub_dis: findDataExist.id_sub_dis,
                sub_dis: findDataExist.sub_dis,
                url: findDataExist.url,
                unit_value: findDataExist.unit_value,
                type_item: findDataExist.type_item,
                unit_set: findDataExist.unit_set,
                coordinator: findDataExist.coordinator,
                company: findDataExist.company,
                source_document: findDataExist.source_document,
                contract_value: findDataExist.contract_value,
            }

            let addToHistory = await model.detail_file_project_history.create(dataHistory, { transaction: t })

            let result
            if (findDataExist) {
                if (checkDocument.approval === true) {
                    let findNewDataSame = await model.detail_file_project_temp.findOne({
                        where: {
                            project_code: data.project_code
                        }
                    })
                    if (findNewDataSame) {
                        responseStatus.resNotAcceptable(res, "Project is already exist")
                    } else {

                        let findDataProgress = await model.v_all_status_project.findOne({
                            where: {
                                [Op.and]: [
                                    { id_project: id_project },
                                    { flag: "actual" }
                                ]
                            }
                        })

                        data.status_approval = null,
                            data.approved_by = null,
                            data.approved_date = null,
                            data.id_progress = findDataProgress ? findDataProgress.id_status : null
                        data.created_at = new Date()
                        data.created_by = req.username
                        data.updated_at = new Date()
                        data.updated_by = req.username

                        result = await model.detail_file_project_temp.create(data, { transaction: t })
                        let deleteToActual = await model.detail_file_project.destroy({
                            where: {
                                id_detail_file_project: id_project
                            },
                            transaction: t
                        })
                    }
                } else {
                    let findNewDataSame = await model.detail_file_project.findOne({
                        where: {
                            [Op.and]: [
                                { id_detail_file_project: { [Op.not]: id_project } },
                                { project_code: data.project_code }
                            ]
                        }
                    })
                    if (findNewDataSame) {
                        responseStatus.resNotAcceptable(res, "Project is already exist")
                    } else {
                        data.updated_by = req.username
                        data.updated_at = new Date()

                        result = await model.detail_file_project.update(data, { where: { id_detail_file_project: id_project }, transaction })
                    }
                }
                await t.commit()
                responseStatus.resCreated(res, result)
            } else {
                responseStatus.resNotFound(res, "Data Not Found")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        console.log(error)
        next(error)
    }
}

// controller.editDataProjectApprovedMobile = async (req, res, next) => {
//     let { id } = req.query
//     let { data } = req.body
//     try {

//     } catch (error) {
//         next(error)
//     }
// }

/*
APPROVE
- req body array id
- ambil project_code nya dari detail_file_project_temp
- cari di detail_file_project udah ada belum 
- kalo ada:
-- copy row yg project_code nya udah ada ke detail_file_project_history
-- delete itu detail_file_project
-- insert yg baru ke detail_file_project
- kalo gak ada:
-- langsung insert ke detail_file_project
*/
controller.approveProjectMobile = async (req, res, next) => {
    let { id, status, description } = req.body
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    try {
        if (!id || id.length < 1) {
            throw new ErrorResponse("Please insert id!", 400)
        }

        let projectApproval = await model.detail_file_project_temp.findAll({
            where: { id_detail_file_project_temp: id }
        })
        console.log("project approval length", projectApproval.length)

        let projectCodeApproval = []

        projectApproval.map((data) => {
            projectCodeApproval.push(data.project_code)
        })

        let checkProjectCode = await model.detail_file_project.findAll({
            where: { project_code: projectCodeApproval }
        })

        console.log("check project code", checkProjectCode)

        if (status === "approved") {
            let dataInsertApprove = []

            projectApproval.map((data, index) => {
                console.log("index", index)
                dataInsertApprove.push({
                    id_marketing: data.id_marketing,
                    project_code: data.project_code,
                    project_data_source: data.project_data_source,
                    status_approval: "approved",
                    approved_by: req.username,
                    approved_date: new Date(),
                    id_keyword: data.id_keyword,
                    input_date: data.input_date,
                    package: data.package,
                    id_procurement_type: data.id_procurement_type,
                    method: data.method,
                    choose_date: data.choose_date,
                    work_unit: data.work_unit,
                    id_location: data.id_location,
                    fund_source: data.fund_source,
                    klpd: data.klpd,
                    created_at: data.created_at,
                    created_by: data.created_by,
                    updated_at: new Date(),
                    updated_by: req.username,
                    filename: data.filename,
                    // id_sub_dis: data.id_sub_dis,
                    sub_dis: data.sub_dis,
                    url: data.url,
                    pagu: data.pagu,
                    unit_value: data.unit_value,
                    type_item: data.type_item,
                    unit_set: data.unit_set,
                    coordinator: data.coordinator,
                    company: data.company,
                    source_document: data.source_document,
                    contract_value: data.contract_value,
                })
            })

            console.log("data insert approve", dataInsertApprove)

            // project temp nyimpen progresnya di field id_progres
            // project actual nyimpen progresnya di tabel status_project
            // jadi kalo dia approved, id_progres diadd baru ke status_project

            if (checkProjectCode.length > 0) {
                // panggil function copy
                console.log("copy to history", id)
                copyToHistory(id)
                // kalo project code nya ada, ambil id dari tabel actual
                let insertProgress = []
                for (let i = 0; i <= checkProjectCode.length - 1; i++) {
                    let searchStatus = await model.detail_file_project_temp.findOne({ where: [{ id_detail_file_project_temp: id[i] }] })
                    console.log("search status", searchStatus)
                    insertProgress.push({
                        id_project: checkProjectCode[i].id_detail_file_project,
                        id_status: searchStatus.id_progress,
                        created_at: new Date(),
                        created_by: req.username,
                        updated_at: new Date(),
                        updated_by: req.username,
                    })
                }
                console.log("insertprogress checkprojectcode > 0", insertProgress)
                let bulkCreateProgress = await model.status_project.bulkCreate(insertProgress, { transaction: t })
                console.log("bulkCreateProgress", bulkCreateProgress)
            } else {
                let insertApprove = await model.detail_file_project.bulkCreate(dataInsertApprove, { transaction: t })
                // kalo project code nya gak ada, ambil id dari sequelize
                let insertProgress = []
                for (let i = 0; i <= insertApprove.length - 1; i++) {
                    console.log("insertApprove[" + i + "]?.iddetail_file_project", insertApprove[i]?.id_detail_file_project)
                    let searchStatus = await model.detail_file_project_temp.findOne({ where: [{ id_detail_file_project_temp: id[i] }, { project_code: insertApprove[i]?.project_code }] })
                    console.log("Search status", searchStatus)
                    console.log("search status[" + i + "]?.id_progress", searchStatus?.id_progress)
                    let findValue = await model.mst_status.findOne({
                        where: {
                            id_status: searchStatus?.id_progress
                        }
                    })
                    insertProgress.push({
                        id_project: insertApprove[i]?.id_detail_file_project,
                        id_status: searchStatus?.id_progress,
                        value: findValue.value,
                        created_at: new Date(),
                        created_by: req.username,
                        updated_at: new Date(),
                        updated_by: req.username,
                    })
                }
                console.log("insertprogress", insertProgress)
                let bulkCreateProgress = await model.status_project.bulkCreate(insertProgress, { transaction: t })
                console.log("bulkcreateprogress", bulkCreateProgress)
                let deleteTemp = await model.detail_file_project_temp.destroy({
                    where: { id_detail_file_project_temp: id },
                    transaction: t
                })
            }
        }
        else if (status === "rejected") {
            let updateTableTemp = await model.detail_file_project_temp.update(
                {
                    description: description,
                    status_approval: "rejected",
                    updated_at: new Date(),
                    updated_by: req.username,
                },
                { where: { id_detail_file_project_temp: id } },
                { transaction: t }
            );

            // if (checkProjectCode.length > 0) {
            //     // panggil function copy
            //     console.log("copy to history", id)
            //     copyToHistory(id)
            // }
        }

        await t.commit()

        return responseStatus.resOK(res, "Data success approved!")
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        next(error)
        console.log(error)
    }
}
controller.approveStatusProjectMobile = async (req, res, next) => {
    let { id } = req.body
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    try {
        if (!id || id.length < 1) {
            throw new ErrorResponse("Please insert id!", 400)
        }

        let statusProjectApproval = await model.status_project_temp.findAll({
            where: { id_project: id }
        })
        console.log("status approval length", statusApproval.length)

        let dataInsertApprove = []

        statusProjectApproval.map((data, index) => {
            console.log("index", index)
            dataInsertApprove.push({
                id_project: data.id_project,
                id_status: data.id_status,
                description: data.description,
                created_at: data.created_at,
                created_by: data.created_by,
                updated_at: new Date(),
                updated_by: req.username,
                approval_by: req.username,
                approval_date: new Date(),
                status_approval: "approved"
            })
        })
        console.log("data insert approve", dataInsertApprove)

        let insertApprove = await model.status_project.bulkCreate(dataInsertApprove, { transaction: t })
        let deleteTemp = await model.status_project_temp.destroy({
            where: { id_project: id },
            transaction: t
        })

        await t.commit()

        return responseStatus.resOK(res, "Data success approved!")
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        next(error)
        console.log(error)
    }
}
controller.rejectStatusProjectMobile = async (req, res, next) => {
    let { id } = req.body
    try {
        if (id) {
            id = typeof id == "string" ? JSON.parse(id) : id
            if (id.length > 0) {
                let dataUpdate = {
                    updated_at: new Date(),
                    updated_by: req.username,
                    status_approval: 'rejected',
                    approval_by: req.username,
                    approval_date: new Date()
                }
                let updateStatusProjectReject = await model.status_project_temp.update(dataUpdate, {
                    where: {
                        id_status_project_temp: { [Op.in]: id }
                    }
                })
                responseStatus.resCreated(res, updateStatusProjectReject)
            } else {
                responseStatus.resBadRequest(res, "Input data is empty")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        next(error)
    }
}
controller.updateStatusProjectMobile = async (req, res, next) => {
    let { id } = req.query
    let { data } = req.body
    try {
        //data.map(x =>{
        data.updated_at = new Date()
        data.updated_by = req.username
        data.status_approval = null,
            data.approval_date = null,
            data.approval_by = null
        //})
        let update = await model.status_project_temp.update(data, {
            where: {
                id_status_project_temp: id
            }
        })
        responseStatus.resCreated(res, update)
    } catch (error) {
        next(error)
    }
}

// async function buildHierarchy(data, parentId = null) {
//     const hierarchy = [];

//     for (const item of data) {
//         if (item.dataValues.id_leader === parentId) {
//             const children = await buildHierarchy(data, item.dataValues.id_profile);
//             console.log(children, '+++++++++')
//             if (children.length > 0) {
//                 item.dataValues.profiles = children;
//             }
//             hierarchy.push(item.dataValues);
//         }
//     }

//     return hierarchy;
// }
// structure organ
controller.getHierarchyMobile = async (req, res, next) => {
    try {
        let findAllDataStructure = await model.v_mst_marketing.findAll({
            where: {
                status: null
            }
        })
        if (findAllDataStructure.length > 0) {
            let result = await buildHierarchy(findAllDataStructure);
            responseStatus.resOK(res, result)
        } else {
            responseStatus.resNotFound(res, "Data Empty")
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}

controller.addStructureOrganMobile = async (req, res, next) => {
    let { id_profile, id_leader } = req.body
    try {
        const structureOrgan = "CALL insert_structure_organ(:p_id_profile, :p_id_leader , :p_username , :p_datetime )";
        const parameter = {
            p_id_profile: id_profile,
            p_id_leader: id_leader,
            p_username: req.username,
            p_datetime: new Date()
        }
        db.query(structureOrgan, {
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
                    return responseStatus.resNotAcceptable(res, "Data Structure Organ is Already Exist");
                } else {
                    return responseStatus.resInternalServerError(res, error);
                }
            });
    } catch (error) {
        next(error)
    }
}

controller.addStructureOrganArrayMobile = async (req, res, next) => {
    let { data } = req.body
    try {
        if (data) {
            data = typeof data == 'string' ? JSON.parse(data) : data
            if (data.length > 0) {
                let dataAddFix = data.map((item) => ({
                    ...item,
                    status: "active",
                    created_at: new Date(),
                    created_by: req.username,
                    updated_at: new Date(),
                    updated_by: req.username
                }));
                let add = await model.structure_organ.bulkCreate(dataAddFix);
                responseStatus.resCreated(res, add)
            } else {
                responseStatus.resBadRequest(res, "Data inputan null")
            }
        } else {
            responseStatus.resBadRequest(res, "Data inputan null")
        }
    } catch (error) {
        next(error)
    }
}
controller.editDownEmployeeMobile = async (req, res, next) => {
    let { data } = req.body
    /*
    [
        1, 2 // id_profile
    ]
    */
    try {
        if (data) {
            console.log("masuk sini")
            data = typeof data == 'string' ? JSON.parse(data) : data
            if (data.length > 0) {
                let updateDataDown = await model.structure_organ.update({
                    status: "non active",
                    updated_at: new Date(),
                    updated_by: req.username
                }, {
                    where: {
                        id_leader: { [Op.in]: data }
                    }
                })
                console.log(updateDataDown, '========')
                responseStatus.resOK(res, "success")
            } else {
                responseStatus.resBadRequest(res, "Data inputan null")
            }
        } else {
            responseStatus.resBadRequest(res, "Data inputan null")
        }
    } catch (error) {
        next(error)
    }
}
controller.editUpEmployeeMobile = async (req, res, next) => {
    let { data } = req.body
    try {
        if (data) {
            data = typeof data == 'string' ? JSON.parse(data) : data
            if (data.length > 0) {
                let updateDataUp = await model.structure_organ.update({
                    status: "non active",
                    updated_at: new Date(),
                    updated_by: req.username
                }, {
                    where: {
                        id_profile: { [Op.in]: data }
                    }
                })
                responseStatus.resOK(res, "success")
            } else {
                responseStatus.resBadRequest(res, "Data inputan null")
            }
        } else {
            responseStatus.resBadRequest(res, "Data inputan null")
        }
    } catch (error) {
        next(error)
    }
}
controller.getOneStructureOrganMobile = async (req, res, next) => {
    let { id_structure_organ, id_profile, id_leader } = req.query
    try {
        let search = {
            where: {

            },
            include: [
                { model: model.mst_profile, as: "profile" },
                { model: model.mst_profile, as: "leader" }
            ],
        }
        if (id_structure_organ) {
            search.where[Op.or] = []
        }

        if (id_profile || id_leader) {
            search.where[Op.and] = []
        }

        if (id_structure_organ) {
            search.where[Op.or].push(
                { id_structure_organ: id_structure_organ }
            )
        }
        if (id_profile) {
            console.log("masuk sini")
            search.where[Op.and].push(
                { id_profile: +id_profile },
                { status: null }
            )
        }
        if (id_leader) {
            search.where[Op.and].push(
                { id_leader: id_leader },
                { status: null }
            )
        }

        let dataStructureOrgan = await model.structure_organ.findOne(search)

        if (dataStructureOrgan) {
            console.log(dataStructureOrgan)

            let findLeader = await model.mst_profile.findOne({
                where: {
                    id_profile: dataStructureOrgan.id_leader
                }
            })
            if (findLeader) {
                dataStructureOrgan.dataValues.leader = findLeader
            }
            responseStatus.resOK(res, dataStructureOrgan)
        } else {
            responseStatus.resNotFound(res, "Data Structure Organ Not Found")
        }
    } catch (error) {
        next(error)
    }
}
controller.editStructureOrganMobile = async (req, res, next) => {
    let { id_structure_organ } = req.query
    let { id_profile, id_leader } = req.body
    try {
        let parameter = {
            p_id_profile: id_profile,
            p_id_leader: id_leader,
            p_username: req.username,
            p_datetime: new Date(),
            p_id_structure_organ: id_structure_organ
        }
        const result = await db.query(
            'SELECT update_structure_organ(:p_id_structure_organ, :p_id_profile, :p_id_leader, :p_username, :p_datetime) as result_text',
            {
                replacements: parameter,
                type: Sequelize.QueryTypes.SELECT,
            }
        )
            .then((results) => {
                console.log(results)
                if (results[0].result_text === 'Data updated successfully') {
                    return responseStatus.resCreated(res, results);
                } else if (results[0].result_text === 'Structure Organ is Already Exist') {
                    return responseStatus.resNotAcceptable(res, results);
                } else {
                    return responseStatus.resNotFound(res, results);
                }
            })
            .catch((error) => {
                next(error)
            });
    } catch (error) {
        next(error)
    }
}
controller.deleteStruckturMobile = async (req, res, next) => {
    let { id_structure_organ } = req.query;
    try {
        let findData = await model.structure_organ.findOne({
            where: {
                id_structure_organ: id_structure_organ
            }
        })
        if (findData) {
            let findAllChild = await model.structure_organ.findAll({
                where: {
                    id_leader: findData.id_profile
                }
            })
            if (findAllChild.length > 0) {
                for (let i = 0; i < findAllChild.length; i++) {
                    let updateDataChild = await model.structure_organ.update({
                        id_leader: null,
                        updated_by: req.username,
                        updated_at: new Date()
                    }, {
                        where: {
                            id_structure_organ: findAllChild[i].id_structure_organ
                        }
                    })
                }
            }

            let deleteData = await model.structure_organ.destroy({
                where: {
                    id_structure_organ: id_structure_organ
                }
            })
            responseStatus.resOK(res, deleteData)
        } else {
            responseStatus.resNotFound(res, "Data Structur Organ Not Found")
        }
    } catch (error) {
        next(error)
    }
}
controller.updateStructureOrganMobile = async (req, res, next) => {
    let { dataId, dataAdd } = req.body
    try {
        if (dataId) {
            dataId = typeof dataId == 'string' ? JSON.parse(dataId) : dataId
            for (let i = 0; i < dataId.length; i++) {
                let updateData = await model.structure_organ.update({
                    status: "non active",
                    updated_at: new Date(),
                    updated_by: req.username
                }, {
                    where: dataId[i]
                })
            }
            if (dataAdd) {
                dataAdd = typeof dataAdd == 'string' ? JSON.parse(dataAdd) : dataAdd
                let dataAddFix = dataAdd.map((item) => ({
                    ...item,
                    status: "active",
                    created_at: new Date(),
                    created_by: req.username,
                    updated_at: new Date(),
                    updated_by: req.username
                }));
                let add = await model.structure_organ.bulkCreate(dataAddFix);
            }
            responseStatus.resOK(res, "Success")
        } else {
            responseStatus.resBadRequest(res, "Data inputan null")
        }
    } catch (error) {
        next(error)
    }
}
// statusProject
controller.addStatusProjectMobile = async (req, res, next) => {
    let { data } = req.body
    let checkDocument = await model.mst_document.findOne({
        where: {
            document_name: "status_project" // harus diinput dulu di master
        }
    })
    try {
        if (data) {
            data = typeof data == "string" ? JSON.parse(data) : data
            if (checkDocument) {

                let findDataValue = await model.mst_status.findOne({
                    where: {
                        id_status: data.id_status
                    }
                })

                data.value = findDataValue.value

                const structureOrgan = "CALL insert_status_project(:p_id_project, :p_id_status , :p_username , :p_datetime, :p_description, :p_condition, :p_value)";
                const parameter = {
                    p_id_project: data.id_project,
                    p_id_status: data.id_status,
                    p_username: req.username,
                    p_datetime: new Date(),
                    p_description: data.description,
                    p_condition: checkDocument.approval,
                    p_value: data.value
                }
                db.query(structureOrgan, {
                    replacements: parameter,
                    type: Sequelize.QueryTypes.RAW, // Use RAW query type for stored procedures
                })
                    .then((results) => {
                        console.log('Procedure executed successfully:', results);
                        return responseStatus.resCreated(res, parameter)
                    })
                    .catch((error) => {
                        console.log(error, "-")
                        return responseStatus.resInternalServerError(res, error);
                    });
            } else {
                responseStatus.resNotAcceptable(res, "Document transaction not found, please insert document first")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        next(error)
    }
}
controller.addStatusProjectBulkMobile = async (req, res, next) => {
    let { data } = req.body
    /*
    data : [
        {
            id_project : "",
            id_status : "",
            description : "",
        }
    ]
    */
    try {
        let checkDocument = await model.mst_document.findOne({
            where: {
                document_name: "status_project" // harus diinput dulu di master
            }
        })
        if (data) {
            data = typeof data == "string" ? JSON.parse(data) : data
            if (data.length > 0) {
                if (checkDocument) {
                    let addStatus

                    for (let i = 0; i < data.length; i++) {
                        data[i].created_at = new Date()
                        data[i].created_by = req.username
                        data[i].updated_at = new Date()
                        data[i].updated_by = req.username

                        if (checkDocument.approval == false) {
                            let findDataValue = await model.mst_status.findOne({
                                where: {
                                    id_status: data[i].id_status
                                }
                            })

                            data[i].value = findDataValue.value
                        }
                    }

                    if (checkDocument.approval == true) {
                        addStatus = await model.status_project_temp.bulkCreate(data);
                    } else {
                        data.map(x => {
                            x.approval_by = req.username,
                                x.approval_date = new Date(),
                                x.status_approval = "approved"
                        })
                        addStatus = await model.status_project.bulkCreate(data);
                    }
                    responseStatus.resCreated(res, addStatus)
                } else {
                    responseStatus.resNotAcceptable(res, "Document transaction not found, please insert document first")
                }
            } else {
                responseStatus.resBadRequest(res, "Input data is empty")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        next(error)
    }
}
controller.getAllDataStatusProjectMobile = async (req, res, next) => {
    let { status, page, size, lang, searchWord } = req.body
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
                [Op.and]: []
            },
            logging: console.log
        }

        if (limit != 0 && offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        if (!(req.role_level == 'Direktur' || req.role_level == 'Superadmin')) {
            search.where[Op.and].push({ id_marketing: req.id_profile });
        }

        if (searchWord) {
            const searchConditions = [
                db.where(db.fn("lower", db.col("project_code")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("package")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("value")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("description")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("employee_name")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("postition")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
                db.where(db.fn("lower", db.col("pagu")), {
                    [Op.like]: `%${searchWord.toLowerCase()}%`,
                }),
            ]
            search.where[Op.and].push({
                [Op.or]: searchConditions
            });
        }

        let listStatusProject

        if (status == 'temp') {
            listStatusProject = await model.v_status_project_temp.findAndCountAll(search);
        } else if (status == 'act') {
            listStatusProject = await model.v_status_project.findAndCountAll(search);
        }

        if (listStatusProject.rows.length > 0) {
            for (let i = 0; i <= listStatusProject.rows.length - 1; i++) {
                listStatusProject.rows[i].dataValues.created_at = moment(listStatusProject.rows[i].dataValues.created_at, "YYYY-MM-DDTHH:mm:ss")
            }
            responseStatus.resOK(res, listStatusProject)
        } else {
            responseStatus.resNotFound(res, "Data Not Found")
        }
    } catch (error) {
        next(error)
    }
}
controller.getAllStatusProjectMobile = async (req, res, next) => {
    let { status, page, size, lang, searchWord, date } = req.body
    try {
        let getPagination = (page, size) => {
            const limit = size ? +size : 0;
            const offset = page ? 0 + (page - 1) * limit : 0;
            return { limit, offset };
        };

        let limit = getPagination(page, size).limit;
        let offset = getPagination(page, size).offset;

        let dataMarketing = [req.id_profile]
        let findMarketing = await model.structure_organ.findAll({
            where: {
                id_leader: req.id_profile
            }
        })

        if (findMarketing.length > 0) {
            findMarketing.map(data => {
                dataMarketing.push(data.id_profile)
            })
        }

        let search = {
            where: {
                [Op.and]: [
                    //{ id_marketing: { [Op.in]: dataMarketing } }
                ],
            }
        }

        if (date) {
            date = new Date(date);
            const formattedDate = date.toISOString().slice(0, 10);
            console.log(formattedDate, "==========")
            search.where[Op.and].push(
                Sequelize.literal(`DATE(updated_at) = '${formattedDate}'`)
            );
        }

        if (searchWord) {
            let globalSearch = {
                [Op.or]: []
            }
            globalSearch[Op.or].push(
                Sequelize.literal(`(LOWER(project_code) LIKE '%${searchWord.toLowerCase()}%' OR LOWER(package) LIKE '%${searchWord.toLowerCase()}%' OR LOWER(value) LIKE '%${searchWord.toLowerCase()}%' OR LOWER(description) LIKE '%${searchWord.toLowerCase()}%' OR LOWER(marketing_name) LIKE '%${searchWord.toLowerCase()}%' OR LOWER(contract_value) LIKE '%${searchWord.toLowerCase()}%')`)
            );
            search.where[Op.and].push(globalSearch);
        }

        if (status) {
            search.where[Op.and].push(Sequelize.literal(`flag = ${status}`));
        }
        if (limit != 0 && offset != 0) {
            search.limit = limit
            search.offset = offset
        }

        let dataAllStatus = await model.v_all_status_project.findAndCountAll(search)

        if (dataAllStatus.rows.length > 0) {
            for (let i = 0; i <= dataAllStatus.rows.length - 1; i++) {
                console.log(dataAllStatus.rows[i])
                dataAllStatus.rows[i].dataValues.created_at = moment(dataAllStatus.rows[i].dataValues.created_at).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
                dataAllStatus.rows[i].dataValues.updated_at = moment(dataAllStatus.rows[i].dataValues.updated_at).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
            }
            responseStatus.resOK(res, dataAllStatus)
        } else {
            responseStatus.resNotFound(res, "Data Not Found")
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}
controller.getOneStatusProjectMobile = async (req, res, next) => {
    let { id_status_project } = req.query
    let { status } = req.body
    try {

        let dataStatusProject
        if (status == 'temp') {
            dataStatusProject = await model.v_status_project_temp.findOne({
                where: {
                    id_status_project_temp: id_status_project
                }
            })
        } else if (status == 'act') {
            dataStatusProject = await model.v_status_project.findOne({
                where: {
                    id_status_project: id_status_project
                }
            })
        }

        if (dataStatusProject) {
            responseStatus.resOK(res, dataStatusProject)
        } else {
            responseStatus.resNotFound(res, "Data Not Found")
        }
    } catch (error) {
        next(error)
    }
}
controller.getProgressDetailMobile = async (req, res, next) => {
    let { id_project } = req.query
    try {
        let dataProgress = await model.v_all_status_project.findAll({
            where: { id_project: id_project },
            order: [['updated_at', 'DESC']]
        })

        if (dataProgress) {
            for (let i = 0; i <= dataProgress.length - 1; i++) {
                console.log(dataProgress[i])
                dataProgress[i].dataValues.created_at = moment(dataProgress[i].dataValues.created_at).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
                dataProgress[i].dataValues.updated_at = moment(dataProgress[i].dataValues.updated_at).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
            }
            responseStatus.resOK(res, dataProgress)
        } else {
            responseStatus.resNotFound(res, "Data Not Found")
        }
    } catch (error) {
        next(error)
    }
}
controller.checkApproveStatusProjectMobile = async (req, res, next) => {
    let { id_project, project_code } = req.query
    try {
        let findDataCheck = await model.v_status_project_temp.findOne({
            where: {
                [Op.and]: [
                    { id_project: id_project },
                    { project_code: project_code }
                ]
            }
        })
        if (findDataCheck) {
            responseStatus.resOK(res, {
                status: 1,
                msg: "Cannot add new progress before approved the last progress"
            })
        } else {
            responseStatus.resOK(res, {
                status: 0,
                msg: "OK"
            })
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}

// daily_activity
controller.addDailyActivityMobile = async (req, res, next) => {
    let { data } = req.body
    let checkDocument = await model.mst_document.findOne({
        where: {
            document_name: "daily_activity" // harus diinput dulu di master
        }
    })
    try { // sehari gak boleh lebih dri 1 kali
        let dataCheck
        console.log(new Date(), "============")
        const today = new Date();
        const formattedDate = today.toISOString().slice(0, 10);
        //let nowDate =
        // if (checkDocument.approval === true) {
        //     dataCheck = await model.daily_activity_temp.findOne({
        //         where: Sequelize.literal(`DATE(activity_date) = '${formattedDate}' AND id_profile = ${req.id_profile}`)
        //     })
        // } else {
        //     dataCheck = await model.daily_activity.findOne({
        //         where: Sequelize.literal(`DATE(activity_date) = '${formattedDate}' AND id_profile = ${req.id_profile}`)
        //     })
        // }
        // console.log(dataCheck)
        // if (dataCheck) throw new ErrorResponse("Data is already exist!", 400)
        if (data) {
            data = typeof data == "string" ? JSON.parse(data) : data
            if (checkDocument) {
                const structureOrgan = "CALL public.insert_daily_activity(:p_id_profile,:p_activity_date,:p_activity,:p_lat,:p_long,:p_username,:p_datetime,:p_condition,:p_address)";

                const parameter = {
                    p_id_profile: req.id_profile,
                    p_activity_date: new Date(),
                    p_activity: data.activity,
                    p_lat: data.lat.toString(),
                    p_long: data.long.toString(),
                    p_username: req.username,
                    p_datetime: new Date(),
                    p_condition: checkDocument.approval,
                    p_address: data.address
                }
                db.query(structureOrgan, {
                    replacements: parameter,
                    type: Sequelize.QueryTypes.RAW, // Use RAW query type for stored procedures
                })
                    .then((results) => {
                        console.log('Procedure executed successfully:', results);
                        return responseStatus.resCreated(res, parameter)
                    })
                    .catch((error) => {
                        console.log(error, "-")
                        return responseStatus.resInternalServerError(res, error);
                    });
            } else {
                responseStatus.resNotAcceptable(res, "Document transaction not found, please insert document first")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        next(error)
    }
}
controller.getOneDailyActivityMobile = async (req, res, next) => {
    let { id_daily_activity } = req.query
    let { status } = req.body
    try {

        let dataDailyActivity
        if (status == 'temp') {
            dataDailyActivity = await model.v_daily_activity_temp.findOne({
                where: {
                    id_daily_activity_temp: id_daily_activity
                }
            })
        } else if (status == 'act') {
            dataDailyActivity = await model.v_daily_activity.findOne({
                where: {
                    id_daily_activity: id_daily_activity
                }
            })
        }

        if (dataDailyActivity) {
            responseStatus.resOK(res, dataDailyActivity)
        } else {
            responseStatus.resNotFound(res, "Data Not Found")
        }
    } catch (error) {
        next(error)
    }
}
controller.approvalDailyActivityMobile = async (req, res, next) => {
    let { id } = req.body
    const t = await db.transaction({
        autoCommitTransactionalOFF: true,
    });
    try {
        if (id) {
            id = typeof id == "string" ? JSON.parse(id) : id
            if (id.length > 0) {
                let dataDailyApprove = await model.daily_activity_temp.findAll({
                    where: { id_daily_activity_temp: id }
                })
                let dataInsertApprove = []

                dataDailyApprove.map((data, index) => {
                    console.log("index", index)
                    dataInsertApprove.push({
                        activity_date: data.activity_date,
                        lat: data.lat.toString(),
                        long: data.long.toString(),
                        activity: data.activity,
                        id_profile: data.id_profile,
                        created_at: data.created_at,
                        created_by: data.created_by,
                        updated_at: new Date(),
                        updated_by: req.username,
                        address: data.address,
                        approval_by: req.username,
                        approval_date: new Date(),
                        status_approval: "approved"
                    })
                })
                console.log("data insert approve", dataInsertApprove)

                let insertApprove = await model.daily_activity.bulkCreate(dataInsertApprove, { transaction: t })
                let deleteTemp = await model.daily_activity_temp.destroy({
                    where: { id_daily_activity_temp: id },
                    transaction: t
                })

                await t.commit()

                return responseStatus.resOK(res, "Data success approved!")
            } else {
                responseStatus.resBadRequest(res, "Input data is empty")
            }
        } else {
            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        next(error)
    }
}
controller.rejectDailyActivityMobile = async (req, res, next) => {
    let { id } = req.body
    try {
        if (id) {
            id = typeof id == "string" ? JSON.parse(id) : id
            if (id.length > 0) {
                let dataUpdate = {
                    updated_at: new Date(),
                    updated_by: req.username,
                    status_approval: 'rejected',
                    approval_by: req.username,
                    approval_date: new Date()
                }
                let updateDailyReject = await model.daily_activity_temp.update(dataUpdate, {
                    where: {
                        id_daily_activity_temp: { [Op.in]: id }
                    }
                })
                responseStatus.resCreated(res, updateDailyReject)
            } else {
                responseStatus.resBadRequest(res, "Input data is empty")
            }
        } else {

            responseStatus.resBadRequest(res, "Input data is empty")
        }
    } catch (error) {
        next(error)
    }
}
controller.updateDailyActivityMobile = async (req, res, next) => {
    let { id } = req.query
    let { data } = req.body
    try {
        //data.map(x =>{
        data.updated_at = new Date()
        data.updated_by = req.username,
            data.status_approval = null,
            data.approval_date = null,
            data.approval_by = null
        //})
        let updateDaily = await model.daily_activity_temp.update(data, {
            where: {
                id_daily_activity_temp: id
            }
        })
        responseStatus.resCreated(res, updateDaily)
    } catch (error) {
        next(error)
    }
}
controller.checkProjectCodeMobile = async (req, res, next) => {
    let { projectCode } = req.body
    try {
        if (!projectCode || projectCode.length < 1) {
            responseStatus.resBadRequest(res, "Input data is empty")
        }

        let project = await model.v_all_project.findAll({
            where: { project_code: projectCode }
        })

        if (!project) {
            return responseStatus.resNotFound(res, "Data not found!")
        }

        return responseStatus.resOK(res, project)

    } catch (error) {
        if (t && !t.finished) await t.rollback();
        next(error)
    }
}

controller.checkCode = async (req, res, next) => {
    let data = {
        receiver: [6],
        parent: 'User Management'
    }
    let dataTrial = await getReceiver(data);
    console.log(dataTrial, "======")
    //let result= []

    responseStatus.resOK(res, dataTrial)
}
module.exports = controller;