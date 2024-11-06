const Sequelize = require("sequelize");
const db = require("../database/database");
const master = require("./master")

const model = {}

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

model.mst_profile = db.define(
    "mst_profile",
    {
        id_profile: {
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.NUMBER
        },
        position: Sequelize.STRING,
        employee_name: Sequelize.STRING,
        phone_number: Sequelize.STRING,
        email: Sequelize.STRING,
        leader_code: Sequelize.STRING,
        id_role: Sequelize.NUMBER,
        username: Sequelize.STRING,
        password: Sequelize.STRING,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        id_location: Sequelize.NUMBER,
        status : Sequelize.STRING,
        company: Sequelize.STRING
    },
    {
        tableName: 'mst_profile',
        name: {
            singular: 'mst_profile',
            plural: 'mst_profile'
        },
        timestamps: false
    }
)

model.mst_role = db.define(
    "mst_role",
    {
        id_role: {
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.NUMBER
        },
        role_name: Sequelize.STRING,
        id_role_level: Sequelize.NUMBER,
        system: Sequelize.STRING
    },
    {
        tableName: 'mst_role',
        name: {
            singular: 'mst_role',
            plural: 'mst_role'
        },
        timestamps: false
    }
)

model.mst_role_event = db.define(
    "mst_role_event",
    {
        id_role_event: {
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.NUMBER
        },
        event: Sequelize.STRING,
        id_role_event_parent: Sequelize.NUMBER
    },
    {
        tableName: 'mst_role_event',
        name: {
            singular: 'mst_role_event',
            plural: 'mst_role_event'
        },
        timestamps: false
    }
)

model.mst_role_event_parent = db.define(
    "mst_role_event_parent",
    {
        id_role_event_parent: {
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.NUMBER
        },
        parent_name: Sequelize.STRING,
        system: Sequelize.STRING
    },
    {
        tableName: 'mst_role_event_parent',
        name: {
            singular: 'mst_role_event_parent',
            plural: 'mst_role_event_parent'
        },
        timestamps: false
    }
)

model.mst_role_level = db.define(
    "mst_role_level",
    {
        id_role_level: {
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.NUMBER
        },
        level_name: Sequelize.STRING
    },
    {
        tableName: 'mst_role_level',
        name: {
            singular: 'mst_role_level',
            plural: 'mst_role_level'
        },
        timestamps: false
    }
)

model.mst_role_management = db.define(
    "mst_role_management",
    {
        id_role_management: {
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.NUMBER
        },
        id_role: Sequelize.NUMBER,
        id_role_event: Sequelize.NUMBER
    },
    {
        tableName: 'mst_role_management',
        name: {
            singular: 'mst_role_management',
            plural: 'mst_role_management'
        },
        timestamps: false
    }
)

model.structure_organ = db.define(
    "structure_organ",
    {
        id_structure_organ: {
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.NUMBER
        },
        id_profile: Sequelize.NUMBER,
        id_leader: Sequelize.NUMBER,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        status : Sequelize.STRING
    },
    {
        tableName: 'structure_organ',
        name: {
            singular: 'structure_organ',
            plural: 'structure_organ'
        },
        timestamps: false
    }
)

model.v_mst_marketing = db.define(
    "v_mst_marketing",
    {
        id_structure_organ: {
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.NUMBER
        },
        id_profile: Sequelize.NUMBER,
        id_leader: Sequelize.NUMBER,
        status: Sequelize.STRING,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        employee_name: Sequelize.STRING,
        position: Sequelize.STRING,
        location_name: Sequelize.STRING,
        leader_name : Sequelize.STRING
    },
    {
        tableName: 'v_mst_marketing',
        name: {
            singular: 'v_mst_marketing',
            plural: 'v_mst_marketing'
        },
        timestamps: false
    }
)

model.v_all_structure_organ = db.define(
    "v_all_structure_organ",
    {
        id_structure_organ: {
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.NUMBER
        },
        id_profile: Sequelize.NUMBER,
        profile_name : Sequelize.STRING,
        email_profile : Sequelize.STRING,
        id_location_profile : Sequelize.NUMBER,
        location_profile : Sequelize.STRING,
        position_profile : Sequelize.STRING,
        id_position_profile : Sequelize.NUMBER,
        id_leader: Sequelize.NUMBER,
        leader_name : Sequelize.STRING,
        email_leader : Sequelize.STRING,
        id_location_leader : Sequelize.NUMBER,
        location_leader : Sequelize.STRING,
        position_leader : Sequelize.STRING,
        id_position_leader : Sequelize.NUMBER,
        status : Sequelize.STRING,

    },
    {
        tableName: 'v_all_structure_organ',
        name: {
            singular: 'v_all_structure_organ',
            plural: 'v_all_structure_organ'
        },
        timestamps: false
    }
)

model.v_all_profile = db.define(
    "v_all_profile",
    {
        id_profile: {
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.NUMBER
        },
        position: Sequelize.STRING,
        employee_name: Sequelize.STRING,
        phone_number: Sequelize.STRING,
        email: Sequelize.STRING,
        leader_code: Sequelize.STRING,
        id_role: Sequelize.NUMBER,
        username: Sequelize.STRING,
        password: Sequelize.STRING,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        id_location: Sequelize.NUMBER,
        location_name : Sequelize.STRING,
        id_position: Sequelize.STRING,
        position_profile: Sequelize.STRING,
        status : Sequelize.STRING,
        company: Sequelize.STRING
    },
    {
        tableName: 'v_all_profile',
        name: {
            singular: 'v_all_profile',
            plural: 'v_all_profile'
        },
        timestamps: false
    }
)
model.v_master_role = db.define(
    "v_master_role",
    {
        id_role_management: {
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.NUMBER
        },
        id_role: Sequelize.NUMBER,
        id_role_event: Sequelize.NUMBER,
        role_name: Sequelize.STRING,
        event : Sequelize.STRING,
        id_role_event_parent: Sequelize.NUMBER,
        parent_name : Sequelize.STRING
    },
    {
        tableName: 'v_master_role',
        name: {
            singular: 'v_master_role',
            plural: 'v_master_role'
        },
        timestamps: false
    }
)
model.detail_location_work = db.define(
    "detail_location_work",
    {
        id_detail_location_work: {
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.NUMBER
        },
        id_profile: Sequelize.NUMBER,
        id_location: Sequelize.NUMBER,
        is_default: Sequelize.STRING
    },
    {
        tableName: 'detail_location_work',
        name: {
            singular: 'detail_location_work',
            plural: 'detail_location_work'
        },
        timestamps: false
    }
)
model.v_detail_location_work = db.define(
    "v_detail_location_work",
    {
        id_location: {
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.NUMBER
        },
        location_name: Sequelize.STRING,
        id_marketing: Sequelize.NUMBER,
        id_coordinator: Sequelize.NUMBER,
        marketing: Sequelize.STRING,
        coordinator: Sequelize.STRING,
        is_default: Sequelize.STRING
    },
    {
        tableName: 'v_detail_location_work',
        name: {
            singular: 'v_detail_location_work',
            plural: 'v_detail_location_work'
        },
        timestamps: false
    }
)

model.mst_profile.hasMany(model.structure_organ, {
    foreignKey: "id_profile",
    sourceKey: "id_profile",
    as: "profile"
})

model.structure_organ.belongsTo(model.mst_profile, {
    foreignKey: "id_profile",
    sourceKey: "id_profile",
    as: "profile"
})

model.mst_profile.hasMany(model.structure_organ, {
    foreignKey: "id_leader",
    sourceKey: "id_profile",
    as: "leader"
})

model.structure_organ.belongsTo(model.mst_profile, {
    foreignKey: "id_profile",
    sourceKey: "id_leader",
    as: "leader"
})

model.mst_role.hasMany(model.mst_profile, {
    foreignKey: "id_role",
    sourceKey: "id_role"
})

model.mst_profile.belongsTo(model.mst_role, {
    foreignKey: "id_role",
    sourceKey: "id_role"
})

master.mst_location.hasMany(model.mst_profile, {
    foreignKey: "id_location",
    sourceKey: "id_location"
})

model.mst_profile.belongsTo(master.mst_location, {
    foreignKey: "id_location",
    sourceKey: "id_location"
})

model.mst_role_level.hasMany(model.mst_role, {
    foreignKey: "id_role_level",
    sourceKey: "id_role_level"
})

model.mst_role.belongsTo(model.mst_role_level, {
    foreignKey: "id_role_level",
    sourceKey: "id_role_level"
})

model.mst_role_event_parent.hasMany(model.mst_role_event, {
    foreignKey: "id_role_event_parent",
    sourceKey: "id_role_event_parent"
})

model.mst_role_event.belongsTo(model.mst_role_event_parent, {
    foreignKey: "id_role_event_parent",
    sourceKey: "id_role_event_parent"
})

model.mst_role.hasMany(model.mst_role_management, {
    foreignKey: "id_role",
    targetKey: "id_role"
})

model.mst_role_management.belongsTo(model.mst_role, {
    foreignKey: "id_role",
    targetKey: "id_role",
});

model.mst_role_event.hasMany(model.mst_role_management, {
    foreignKey: "id_role_event",
    targetKey: "id_role_event",
})

model.mst_role_management.belongsTo(model.mst_role_event, {
    foreignKey: "id_role_event",
    targetKey: "id_role_event",
});

// model.mst_profile.hasMany(master.mst_sub_dis, {
//     foreignKey: "id_coordinator",
//     sourceKey: "id_profile"
// })
// master.mst_sub_dis.belongsTo(model.mst_profile, {
//     foreignKey: "id_coordinator",
//     sourceKey: "id_profile"
// })

master.mst_location.hasMany(model.detail_location_work, {
    foreignKey: "id_location",
    sourceKey: "id_location"
})

model.detail_location_work.belongsTo(master.mst_location, {
    foreignKey: "id_location",
    sourceKey: "id_location"
})

module.exports = model;