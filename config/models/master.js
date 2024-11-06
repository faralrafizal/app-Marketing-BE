const Sequelize = require("sequelize");
const db = require("../database/database");
//const role = require("./roleUser");
//const { mst_profile } = require(".");

const master = {}

const dbConfig = {
    schema: db.options.schema,
    freezeTableName: true,
    timestamps: false,
    pool: {
        max: 5,
        min: 2,
        idle: 20000,
        acquire: 20000,
    },
};

master.mst_document = db.define(
    "mst_document",
    {
        id_document: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true,
        },
        document_name: Sequelize.STRING,
        approval: Sequelize.BOOLEAN
    }, 
    {
        tableName: 'mst_document',
        name: {
            singular: 'mst_document',
            plural: 'mst_document'
        },
        timestamps: false
    }
)

master.mst_keyword = db.define(
    "mst_keyword",
    {
        id_keyword: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true,
        },
        keyword: Sequelize.STRING
    }, 
    {
        tableName: 'mst_keyword',
        name: {
            singular: 'mst_keyword',
            plural: 'mst_keyword'
        },
        timestamps: false
    }
)

master.mst_location = db.define(
    "mst_location",
    {
        id_location: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true,
        },
        location_name: Sequelize.STRING,
        id_province: Sequelize.NUMBER
    }, 
    {
        tableName: 'mst_location',
        name: {
            singular: 'mst_location',
            plural: 'mst_location'
        },
        timestamps: false
    }
)

master.mst_procurement_type = db.define(
    "mst_procurement_type",
    {
        id_procurement_type: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true,
        },
        type: Sequelize.STRING
    }, 
    {
        tableName: 'mst_procurement_type',
        name: {
            singular: 'mst_procurement_type',
            plural: 'mst_procurement_type'
        },
        timestamps: false
    }
)

master.mst_province = db.define(
    "mst_province",
    {
        id_province: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true,
        },
        province_name: Sequelize.STRING
    }, 
    {
        tableName: 'mst_province',
        name: {
            singular: 'mst_province',
            plural: 'mst_province'
        },
        timestamps: false
    }
)

master.mst_status = db.define(
    "mst_status",
    {
        id_status: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true,
        },
        value: Sequelize.NUMBER,
        description: Sequelize.STRING
    }, 
    {
        tableName: 'mst_status',
        name: {
            singular: 'mst_status',
            plural: 'mst_status'
        },
        timestamps: false
    }
)

master.v_location_province = db.define(
    "v_location_province",
    {
        id_location: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true,
        },
        location_name: Sequelize.STRING,
        id_province: Sequelize.NUMBER,
        province_name: Sequelize.STRING
    }, 
    {
        tableName: 'v_location_province',
        name: {
            singular: 'v_location_province',
            plural: 'v_location_province'
        },
        timestamps: false
    }
)

master.mst_sub_dis = db.define(
    "mst_sub_dis",
    {
        id_sub_dis: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true,
        },
        sub_dis_name: Sequelize.STRING,
        id_location: Sequelize.NUMBER,
        id_coordinator : Sequelize.NUMBER,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING
    },
    {
        tableName: 'mst_sub_dis',
        name: {
            singular: 'mst_sub_dis',
            plural: 'mst_sub_dis'
        },
        timestamps: false
    }
)
master.history_notification = db.define(
    "history_notification",
    {
        id_notification: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true,
        },
        header : Sequelize.STRING,
        message : Sequelize.STRING,
        receiver : Sequelize.STRING,
        sender : Sequelize.STRING,
        created_at : Sequelize.DATE,
        read_at : Sequelize.DATE,
        url: Sequelize.STRING
    },
    {
        tableName: 'history_notification',
        name: {
            singular: 'history_notification',
            plural: 'history_notification'
        },
        timestamps: false
    }
)

master.mst_position = db.define(
    "mst_position",
    {
        id_position: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true,
        },
        position: Sequelize.STRING
    },
    {
        tableName: 'mst_position',
        name: {
            singular: 'mst_position',
            plural: 'mst_position'
        },
        timestamps: false
    }
)

master.mst_location.hasMany(master.mst_sub_dis, {
    foreignKey: "id_location",
    targetKey: "id_location"
})
master.mst_sub_dis.belongsTo(master.mst_location, {
    foreignKey: "id_location",
    targetKey: "id_location"
})

master.mst_province.hasMany(master.mst_location, {
    foreignKey: "id_province",
    targetKey: "id_province"
})

master.mst_location.belongsTo(master.mst_province, {
    foreignKey: "id_province",
    targetKey: "id_province"
})

module.exports = master;