const model = require("../config/models")
const db = require("../config/database/database");
const Sequelize = require("sequelize");
const notification = {}
const { Op } = require("sequelize");

notification.addToTableHistoryNotif = async (data) => { // satu2
    try {
        if (!data) {
            throw new ErrorResponse("data tidak lengkap", 400)
        }
        let result = {
            header: data.header,
            message: data.message,
            receiver: data.receiver,
            sender: data.sender,
            created_at: new Date(),
            url: data.url
        }

        let dataInput = await model.history_notification.create(result);
        if (!dataInput) {
            throw new ErrorResponse("data tidak terinput", 400)
        }
        return { code: 201, data: dataInput };
    } catch (error) {
        return error;
    }
}

notification.payloadToNotif = async (header, message, receiver, sender, url) => {
    try {
        if (!header && !message && !receiver && !sender && !url) {
            throw new ErrorResponse("data tidak lengkap", 400)
        }
        let result = {
            header: header,
            message: message,
            receiver: receiver,
            sender: sender,
            created_at: new Date(),
            url: url
        }
        return result;
    } catch (error) {
        return error;
    }
}
notification.getReceiverToApprove = async (data) => {
    try {
        let receiver = []
        let role = []
        let findDataRole = await model.history_notification.findAll({
            where: {
                event: data
            }
        })
        if (findDataRole.length > 0) {
            findDataRole.map((x) => {
                role.push(x.id_role)
            })
        }

        if (role.length > 0) {
            let findDataUser = await model.mst_profile.findAll({
                where: {
                    id_role: role
                }
            })
            if (findDataUser.length > 0) {
                findDataUser.map((y) => {
                    receiver.push(y.id_profile)
                })
            }
        }
        return { code: 200, receiver: receiver };
    } catch (error) {
        return { code: 500, msg: error }
    }
}

async function checkRoleEvent(data){
    //console.log(data, '=+=data')
    let findEvent = await model.v_master_role.findAll({
        where: {
            id_role: data.id_role,
            parent_name: data.parent,
            [Op.or]: [
                {
                    event: {
                        [Op.like]: '%Vi%',
                    },
                },
                {
                    event: 'Create',
                },
                {
                    event: 'Delete',
                },
                {
                    event: 'Add',
                },
                {
                    event: {
                        [Op.like]: '%Approval%',
                    },
                },
            ],
          },
    });
      //console.log(findEvent, '++++find')
    return findEvent
}

function getUniqueDataByReceiver(inputArray) {
    const uniqueReceivers = [...new Set(inputArray.map(item => item.receiver))];
  
    // Filter data unik berdasarkan receiver
    const uniqueData = uniqueReceivers.map(receiver => {
      const matchingData = inputArray.find(item => item.receiver === receiver);
      return matchingData;
    });
  
    return uniqueData;
  }

notification.getReceiver = async (data) => {
    try {
        /*
        marketing, coordinator, subdis
        = > cari role eventnya dia bisa gak view, add, update, approval
        = > cari di struktur organnya 

        let data = {
        receiver : [6],
        parent: 'User Management',
        header: 'Pooo'
        credential : '' == > 
        }

        */
       let dataReceiver = []
       let result 
       console.log(data.receiver, '+++___+++datarec')
        if (data.receiver.length > 0) {
            for (let i = 0; i < data.receiver.length > 0; i++) {
                let findRoleProfile = await model.mst_profile.findOne({
                    where : {
                        id_profile : data.receiver[i]
                    }
                })
                //console.log(findRoleProfile)
                if (findRoleProfile != null){
                    console.log('masuk sini')
                    // cari event dari rolenya
                    let findEvent = await checkRoleEvent({id_role: findRoleProfile.id_role, parent: data.parent})
                    // console.log(findEvent)
                    // result = findEvent
                    if(findEvent.length > 0){
                        console.log(data.receiver[i], '+++dataRec')
                        let findDataStructure = await model.v_mst_marketing.findAll({
                            where : {
                                id_profile : data.receiver[i]
                            }
                        })
                        console.log(findDataStructure, '___struc1', data.receiver[i])
                        if(findDataStructure.length > 0){
                            dataReceiver.push({
                                receiver : data.receiver[i],
                                credential : data.credential,
                                header : data.header
                            })
                            //console.log(dataReceiver, '+++++++++))')
                            for (let j = 0; j < findDataStructure.length ;j++){ 
                                //console.log( findDataStructure[j], '++0000')
                                let findRole = await model.mst_profile.findOne({
                                    where : {
                                        id_profile : findDataStructure[j].id_profile
                                    }
                                })
                                let checkEvent = await checkRoleEvent({
                                    id_role : findRole.id_role, parent: data.parent
                                })
                                if(checkEvent.length > 0){
                                    dataReceiver.push({
                                        receiver :findDataStructure[j].id_leader,
                                        credential : data.credential,
                                        header : data.header
                                    })
                                }
                            }
                        }
                    }
                }
            }
            if(dataReceiver.length > 0){
                let dataDistict = getUniqueDataByReceiver(dataReceiver)
                dataReceiver = dataDistict
            }
            return dataReceiver
        }
    } catch (error) {
        return error
    }
}
module.exports = notification;