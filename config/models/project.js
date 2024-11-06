const Sequelize = require("sequelize");
const db = require("../database/database");
const master = require("./master")     

const project = {}

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

project.daily_activity = db.define(
    "daily_activity",
    {
        id_daily_activity: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        activity_date: Sequelize.DATE,
        lat: Sequelize.STRING,
        long: Sequelize.STRING,
        activity: Sequelize.STRING,
        id_profile: Sequelize.NUMBER,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        address : Sequelize.STRING,
        status_approval : Sequelize.STRING,
        approval_date : Sequelize.DATE,
        approval_by : Sequelize.STRING
    },
    {
        tableName: 'daily_activity',
        name: {
            singular: 'daily_activity',
            plural: 'daily_activity'
        },
        timestamps: false
    }
)
project.daily_activity_temp = db.define(
    "daily_activity_temp",
    {
        id_daily_activity_temp: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        activity_date: Sequelize.DATE,
        lat: Sequelize.STRING,
        long: Sequelize.STRING,
        activity: Sequelize.STRING,
        id_profile: Sequelize.NUMBER,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        address : Sequelize.STRING,
        status_approval : Sequelize.STRING,
        approval_date : Sequelize.DATE,
        approval_by : Sequelize.STRING
    },
    {
        tableName: 'daily_activity_temp',
        name: {
            singular: 'daily_activity_temp',
            plural: 'daily_activity_temp'
        },
        timestamps: false
    }
)
project.detail_file_project = db.define(
    "detail_file_project",
    {
        id_detail_file_project: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        id_marketing: Sequelize.NUMBER,
        project_code: Sequelize.STRING,
        project_data_source: Sequelize.STRING,
        status_approval: Sequelize.STRING,
        approved_by: Sequelize.STRING,
        approved_date: Sequelize.DATE,
        id_keyword: Sequelize.NUMBER,
        input_date: Sequelize.DATE,
        package: Sequelize.STRING,
        id_procurement_type: Sequelize.NUMBER,
        method: Sequelize.STRING,
        choose_date: Sequelize.DATE,
        work_unit: Sequelize.STRING,
        id_location: Sequelize.NUMBER,
        fund_source: Sequelize.STRING,
        klpd: Sequelize.STRING,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        filename: Sequelize.STRING,
        id_sub_dis: Sequelize.NUMBER,
        sub_dis: Sequelize.STRING,
        url: Sequelize.STRING,
        pagu: Sequelize.NUMBER,
        project_value: Sequelize.NUMBER,
        unit_value: Sequelize.NUMBER,
        type_item : Sequelize.STRING,
        //id_header_project: Sequelize.NUMBER,
        unit_set : Sequelize.NUMBER,
        coordinator: Sequelize.NUMBER,
        company: Sequelize.STRING,
        source_document: Sequelize.STRING,
        contract_value : Sequelize.FLOAT
    },
    {
        tableName: 'detail_file_project',
        name: {
            singular: 'detail_file_project',
            plural: 'detail_file_project'
        },
        timestamps: false
    }
)
project.detail_file_project_temp = db.define(
    "detail_file_project_temp",
    {
        id_detail_file_project_temp: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        id_marketing: Sequelize.NUMBER,
        project_code: Sequelize.STRING,
        project_data_source: Sequelize.STRING,
        status_approval: Sequelize.STRING,
        approved_by: Sequelize.STRING,
        approved_date: Sequelize.DATE,
        id_keyword: Sequelize.NUMBER,
        input_date: Sequelize.DATE,
        package: Sequelize.STRING,
        id_procurement_type: Sequelize.NUMBER,
        method: Sequelize.STRING,
        choose_date: Sequelize.DATE,
        work_unit: Sequelize.STRING,
        id_location: Sequelize.NUMBER,
        fund_source: Sequelize.STRING,
        klpd: Sequelize.STRING,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        filename: Sequelize.STRING,
        id_sub_dis: Sequelize.NUMBER,
        sub_dis: Sequelize.STRING,
        url: Sequelize.STRING,
        pagu: Sequelize.NUMBER,
        description: Sequelize.STRING,
        unit_value: Sequelize.NUMBER,
        type_item : Sequelize.STRING,
        unit_set : Sequelize.NUMBER,
        coordinator: Sequelize.NUMBER,
        company: Sequelize.STRING,
        id_progress: Sequelize.NUMBER,
        source_document: Sequelize.STRING,
        contract_value : Sequelize.FLOAT
    },
    {
        tableName: 'detail_file_project_temp',
        name: {
            singular: 'detail_file_project_temp',
            plural: 'detail_file_project_temp'
        },
        timestamps: false
    }
)
project.detail_file_project_history = db.define(
    "detail_file_project_history",
    {
        id_detail_file_project_history: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        id_marketing: Sequelize.NUMBER,
        project_code: Sequelize.STRING,
        project_data_source: Sequelize.STRING,
        status_approval: Sequelize.STRING,
        approved_by: Sequelize.STRING,
        approved_date: Sequelize.DATE,
        id_keyword: Sequelize.NUMBER,
        input_date: Sequelize.DATE,
        package: Sequelize.STRING,
        pagu: Sequelize.NUMBER,
        id_procurement_type: Sequelize.NUMBER,
        //id_header_project: Sequelize.NUMBER,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        filename: Sequelize.STRING,
        id_sub_dis: Sequelize.NUMBER,
        sub_dis: Sequelize.STRING,
        url: Sequelize.STRING,
        description: Sequelize.STRING,
        unit_value: Sequelize.FLOAT,
        type_item : Sequelize.STRING,
        unit_set : Sequelize.FLOAT,
        coordinator : Sequelize.NUMBER,
        company : Sequelize.STRING,
        source_document : Sequelize.STRING,
        contract_value : Sequelize.FLOAT
    },
    {
        tableName: 'detail_file_project_history',
        name: {
            singular: 'detail_file_project_history',
            plural: 'detail_file_project_history'
        },
        timestamps: false
    }
)
project.header_project = db.define(
    "header_project",
    {
        id_header_project: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        file_name: Sequelize.STRING,
        date_upload: Sequelize.DATE,
        id_profile: Sequelize.NUMBER,
        //id_detail_file_project: Sequelize.NUMBER,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING
    },
    {
        tableName: 'header_project',
        name: {
            singular: 'header_project',
            plural: 'header_project'
        },
        timestamps: false
    }
)
project.status_project = db.define(
    "status_project",
    {
        id_status_project: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        id_project: Sequelize.NUMBER,
        id_status: Sequelize.NUMBER,
        description: Sequelize.STRING,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        value: Sequelize.STRING,
        status_approval : Sequelize.STRING,
        approval_date : Sequelize.DATE,
        approval_by : Sequelize.STRING
    },
    {
        tableName: 'status_project',
        name: {
            singular: 'status_project',
            plural: 'status_project'
        },
        timestamps: false
    }
)
project.status_project_temp = db.define(
    "status_project_temp",
    {
        id_status_project_temp: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        id_project: Sequelize.NUMBER,
        id_status: Sequelize.NUMBER,
        description: Sequelize.STRING,
        //value: Sequelize.STRING,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        status_approval : Sequelize.STRING,
        approval_date : Sequelize.DATE,
        approval_by : Sequelize.STRING,
        contract_value: Sequelize.NUMBER
    },
    {
        tableName: 'status_project_temp',
        name: {
            singular: 'status_project_temp',
            plural: 'status_project_temp'
        },
        timestamps: false
    }
)
project.v_all_project = db.define(
    "v_all_project",
    {
        flag: Sequelize.STRING,
        id_project: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        id_marketing: Sequelize.NUMBER,
        marketing_name: Sequelize.STRING,
        project_code: Sequelize.STRING,
        project_data_source: Sequelize.STRING,
        status_approval: Sequelize.STRING,
        approved_by: Sequelize.STRING,
        approved_date: Sequelize.DATE,
        id_keyword: Sequelize.NUMBER,
        keyword: Sequelize.STRING,
        input_date: Sequelize.DATE,
        package: Sequelize.STRING,
        url: Sequelize.STRING,
        pagu: Sequelize.NUMBER,
        id_procurement_type: Sequelize.NUMBER,
        procurement_type: Sequelize.STRING,
        method: Sequelize.STRING,
        choose_date: Sequelize.DATE,
        work_unit: Sequelize.STRING,
        id_location: Sequelize.NUMBER,
        location_name: Sequelize.STRING,
        fund_source: Sequelize.STRING,
        klpd: Sequelize.STRING,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        filename: Sequelize.STRING,
        id_sub_dis: Sequelize.NUMBER,
        sub_dis_name: Sequelize.STRING,
        unit_value: Sequelize.NUMBER,
        type_item: Sequelize.STRING,
        unit_set: Sequelize.NUMBER,
        coordinator: Sequelize.NUMBER,
        coordinator_name: Sequelize.STRING,
        company: Sequelize.STRING,
        source_document: Sequelize.STRING,
        id_status: Sequelize.NUMBER,
        progress_flag: Sequelize.STRING,
        progress_value: Sequelize.STRING,
        progress_description: Sequelize.STRING,
        progress_remarks: Sequelize.STRING,
        contract_value : Sequelize.FLOAT
    },
    {
        tableName: 'v_all_project',
        name: {
            singular: 'v_all_project',
            plural: 'v_all_project'
        },
        timestamps: false
    }
)
project.v_project_detail = db.define(
    "v_project_detail",
    {
        id_detail_file_project: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        id_marketing: Sequelize.NUMBER,
        project_code: Sequelize.STRING,
        project_data_source: Sequelize.STRING,
        status_approval: Sequelize.STRING,
        approved_by: Sequelize.STRING,
        approved_date: Sequelize.DATE,
        id_keyword: Sequelize.NUMBER,
        input_date: Sequelize.DATE,
        package: Sequelize.STRING,
        pagu: Sequelize.NUMBER,
        method: Sequelize.STRING,
        choose_date: Sequelize.DATE,
        work_unit: Sequelize.STRING,
        id_location: Sequelize.NUMBER,
        fund_source: Sequelize.STRING,
        klpd: Sequelize.STRING,
        id_procurement_type: Sequelize.NUMBER,
        //id_header_project: Sequelize.NUMBER,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        filename: Sequelize.STRING,
        id_sub_dis: Sequelize.NUMBER,
        url: Sequelize.STRING,
        pagu: Sequelize.NUMBER,
        project_value: Sequelize.NUMBER,
        unit_value: Sequelize.NUMBER,
        type_item : Sequelize.STRING,
        unit_set : Sequelize.NUMBER,
        coordinator: Sequelize.NUMBER,
        company: Sequelize.STRING,
        source_document: Sequelize.STRING,
        marketing_name: Sequelize.STRING,
        keyword: Sequelize.STRING,
        procurement_type: Sequelize.STRING,
        location_name: Sequelize.STRING,
        sub_dis_name: Sequelize.STRING,
        coordinator_name: Sequelize.STRING,
        id_status: Sequelize.NUMBER,
        progress_flag: Sequelize.STRING,
        progress_value: Sequelize.STRING,
        progress_description: Sequelize.STRING,
        progress_remarks: Sequelize.STRING,
        contract_value : Sequelize.FLOAT
    },
    {
        tableName: 'v_project_detail',
        name: {
            singular: 'v_project_detail',
            plural: 'v_project_detail'
        },
        timestamps: false
    }
)
project.v_project_temp_detail = db.define(
    "v_project_temp_detail",
    {
        id_detail_file_project_temp: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        id_marketing: Sequelize.NUMBER,
        project_code: Sequelize.STRING,
        project_data_source: Sequelize.STRING,
        status_approval: Sequelize.STRING,
        approved_by: Sequelize.STRING,
        approved_date: Sequelize.DATE,
        id_keyword: Sequelize.NUMBER,
        input_date: Sequelize.DATE,
        package: Sequelize.STRING,
        pagu: Sequelize.NUMBER,
        method: Sequelize.STRING,
        choose_date: Sequelize.DATE,
        work_unit: Sequelize.STRING,
        id_location: Sequelize.NUMBER,
        fund_source: Sequelize.STRING,
        klpd: Sequelize.STRING,
        id_procurement_type: Sequelize.NUMBER,
        //id_header_project: Sequelize.NUMBER,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        filename: Sequelize.STRING,
        id_sub_dis: Sequelize.NUMBER,
        url: Sequelize.STRING,
        pagu: Sequelize.NUMBER,
        unit_value: Sequelize.NUMBER,
        type_item : Sequelize.STRING,
        unit_set : Sequelize.NUMBER,
        coordinator: Sequelize.NUMBER,
        company: Sequelize.STRING,
        source_document: Sequelize.STRING,
        marketing_name: Sequelize.STRING,
        keyword: Sequelize.STRING,
        procurement_type: Sequelize.STRING,
        location_name: Sequelize.STRING,
        sub_dis_name: Sequelize.STRING,
        coordinator_name: Sequelize.STRING,
        id_status: Sequelize.NUMBER,
        progress_value: Sequelize.STRING,
        progress_description: Sequelize.STRING,
        contract_value : Sequelize.FLOAT
    },
    {
        tableName: 'v_project_temp_detail',
        name: {
            singular: 'v_project_temp_detail',
            plural: 'v_project_temp_detail'
        },
        timestamps: false
    }
)
project.v_status_project_temp = db.define(
    "v_status_project_temp",
    {
        id_status_project_temp: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        id_project: Sequelize.NUMBER,
        id_status: Sequelize.NUMBER,
        description: Sequelize.STRING,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        id_marketing: Sequelize.NUMBER,
        project_code: Sequelize.STRING,
        package: Sequelize.STRING,
        pagu: Sequelize.NUMBER,
        id_sub_dis: Sequelize.NUMBER,
        value: Sequelize.NUMBER,
        status_desc: Sequelize.STRING,
        employee_name: Sequelize.STRING,
        position: Sequelize.STRING,
        id_position: Sequelize.NUMBER,
        sub_dis_name: Sequelize.STRING
    },
    {
        tableName: 'v_status_project_temp',
        name: {
            singular: 'v_status_project_temp',
            plural: 'v_status_project_temp'
        },
        timestamps: false
    }
)
project.v_status_project = db.define(
    "v_status_project",
    {
        id_status_project: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        id_project: Sequelize.NUMBER,
        id_status: Sequelize.NUMBER,
        description: Sequelize.STRING,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        id_marketing: Sequelize.NUMBER,
        project_code: Sequelize.STRING,
        package: Sequelize.STRING,
        pagu: Sequelize.NUMBER,
        id_sub_dis: Sequelize.NUMBER,
        value: Sequelize.NUMBER,
        status_desc: Sequelize.STRING,
        employee_name: Sequelize.STRING,
        position: Sequelize.STRING,
        id_position: Sequelize.NUMBER,
        sub_dis_name: Sequelize.STRING
    },
    {
        tableName: 'v_status_project',
        name: {
            singular: 'v_status_project',
            plural: 'v_status_project'
        },
        timestamps: false
    }
)
project.v_daily_activity = db.define(
    "v_daily_activity",
    {
        id_daily_activity: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        activity_date: Sequelize.DATE,
        lat: Sequelize.STRING,
        long: Sequelize.STRING,
        activity: Sequelize.STRING,
        id_profile: Sequelize.NUMBER,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        employee_name: Sequelize.STRING,
        email: Sequelize.STRING
    },
    {
        tableName: 'v_daily_activity',
        name: {
            singular: 'v_daily_activity',
            plural: 'v_daily_activity'
        },
        timestamps: false
    }
)
project.v_daily_activity_temp = db.define(
    "v_daily_activity_temp",
    {
        id_daily_activity_temp: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        activity_date: Sequelize.DATE,
        lat: Sequelize.STRING,
        long: Sequelize.STRING,
        activity: Sequelize.STRING,
        id_profile: Sequelize.NUMBER,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        employee_name: Sequelize.STRING,
        email: Sequelize.STRING
    },
    {
        tableName: 'v_daily_activity_temp',
        name: {
            singular: 'v_daily_activity_temp',
            plural: 'v_daily_activity_temp'
        },
        timestamps: false
    }
)

project.v_all_daily_activity = db.define(
    "v_all_daily_activity",
    {
        flag: Sequelize.STRING,
        id: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        activity_date: Sequelize.DATE,
        lat: Sequelize.STRING,
        long: Sequelize.STRING,
        activity: Sequelize.STRING,
        id_profile: Sequelize.NUMBER,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        address: Sequelize.STRING,
        employee_name: Sequelize.STRING,
        email: Sequelize.STRING,
        company : Sequelize.STRING
    },
    {
        tableName: 'v_all_daily_activity',
        name: {
            singular: 'v_all_daily_activity',
            plural: 'v_all_daily_activity'
        },
        timestamps: false
    }
)

project.v_all_status_project = db.define(
    "v_all_status_project",
    {
        flag: Sequelize.STRING,
        id_status_project: {
            type: Sequelize.NUMBER,
            autoIncrement: true,
            primaryKey: true
        },
        id_project: Sequelize.NUMBER,
        id_status: Sequelize.NUMBER,
        description: Sequelize.STRING,
        created_at: Sequelize.DATE,
        created_by: Sequelize.STRING,
        updated_at: Sequelize.DATE,
        updated_by: Sequelize.STRING,
        id_marketing: Sequelize.NUMBER,
        project_code: Sequelize.STRING,
        package: Sequelize.STRING,
        value: Sequelize.NUMBER,
        marketing_name: Sequelize.STRING,
        contract_value : Sequelize.FLOAT,
        coordinator_name: Sequelize.STRING
    },
    {
        tableName: 'v_all_status_project',
        name: {
            singular: 'v_all_status_project',
            plural: 'v_all_status_project'
        },
        timestamps: false
    }
)
master.mst_sub_dis.hasMany(project.detail_file_project, {
    foreignKey: "id_sub_dis",
    targetKey: "id_sub_dis"
})

project.detail_file_project.belongsTo(master.mst_sub_dis, {
    foreignKey: "id_sub_dis",
    targetKey: "id_sub_dis"
})

master.mst_sub_dis.hasMany(project.detail_file_project_temp, {
    foreignKey: "id_sub_dis",
    targetKey: "id_sub_dis"
})

project.detail_file_project_temp.belongsTo(master.mst_sub_dis, {
    foreignKey: "id_sub_dis",
    targetKey: "id_sub_dis"
})

master.mst_keyword.hasMany(project.detail_file_project, {
    foreignKey: "id_keyword",
    targetKey: "id_keyword"
})

project.detail_file_project.belongsTo(master.mst_keyword, {
    foreignKey: "id_keyword",
    targetKey: "id_keyword"
})

master.mst_procurement_type.hasMany(project.detail_file_project, {
    foreignKey: "id_procurement_type",
    targetKey: "id_procurement_type"
})

project.detail_file_project.belongsTo(master.mst_procurement_type, {
    foreignKey: "id_procurement_type",
    targetKey: "id_procurement_type"
})

master.mst_status.hasMany(project.status_project, {
    foreignKey: "id_status",
    targetKey: "id_status"
})

project.status_project.belongsTo(master.mst_status, {
    foreignKey: "id_status",
    targetKey: "id_status"
})

project.detail_file_project.hasMany(project.status_project, {
    foreignKey: "id_project",
    sourceKey: "id_detail_file_project"
})

project.status_project.belongsTo(project.detail_file_project, {
    foreignKey: "id_project",
    sourceKey: "id_detail_file_project"
})

master.mst_status.hasMany(project.status_project_temp, {
    foreignKey: "id_status",
    targetKey: "id_status"
})

project.status_project_temp.belongsTo(master.mst_status, {
    foreignKey: "id_status",
    targetKey: "id_status"
})

project.detail_file_project.hasMany(project.status_project_temp, {
    foreignKey: 'id_project', // Kolom pada StatusProjectTemp yang berperan sebagai kunci asing
    sourceKey: 'id_detail_file_project'
})

project.status_project_temp.belongsTo(project.detail_file_project, {
    foreignKey: 'id_project', // Kolom pada StatusProjectTemp yang berperan sebagai kunci asing
    targetKey: 'id_detail_file_project'
})
module.exports = project;