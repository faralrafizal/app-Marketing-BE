const db = require("../database/database");
const Sequelize = require("sequelize");
const event = {}



event.headerEvent = db.define(
    "header_event",
    {
        id_event: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        event_name: Sequelize.STRING,
        desc: Sequelize.STRING,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        link_meeting: Sequelize.STRING,
        timezone: Sequelize.STRING,
        timer: Sequelize.STRING,
    },
    {
        tableName: 'header_event',
        name: {
            singular: 'header_event',
            plural: 'header_event'
        },
        timestamps: false
    }
)


event.detailDateEvent = db.define(
    "detail_date_event",
    {
        id_detail_date: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        // id_event: {
        //     type: Sequelize.NUMBER,
        //     model: event.headerEvent, // 'Movies' would also work
        //     key: 'id_event'
        // },
        id_event: Sequelize.NUMBER,
        date_event: Sequelize.DATE,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
    },
    {
        tableName: 'detail_date_event',
        name: {
            singular: 'detail_date_event',
            plural: 'detail_date_event'
        },
        timestamps: false
    }
)



event.detailUserInvite = db.define(
    "detail_user_invite",
    {
        id_user_invite: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        id_detail_date:Sequelize.NUMBER,
        // id_event: {
        //     type: Sequelize.NUMBER,
        //     model: event.headerEvent, // 'Movies' would also work
        //     key: 'id_event'
        // },
        id_event: Sequelize.NUMBER,
        user_id:Sequelize.NUMBER,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
    },
    {
        tableName: 'detail_user_invite',
        name: {
            singular: 'detail_user_invite',
            plural: 'detail_user_invite'
        },
        timestamps: false
    }
)

// event.headerEvent.hasMany(event.detailDateEvent);
// event.headerEvent.hasMany(event.detailUserInvite);
module.exports = event;