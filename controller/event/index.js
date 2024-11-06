const {Op} = require("sequelize");
const db = require("../../config/database/database");
const model = require("../../config/models");
const responseStatus = require("../../utils/responseStatus");
const Sequelize = require("sequelize");
const ErrorResponse = require("../../utils/errorResponse");
const moment = require("moment");
const sequelize = require("sequelize");
const headerEvent = model.headerEvent;
const detailDateEvent = model.detailDateEvent;
const detailUserInvite = model.detailUserInvite;
const controller = {}


controller.getEvent = async (req, res, next) => {
    try {
        let dataHeader = await headerEvent.findAll()
        let result=[];
        for (var header of dataHeader) {

            let detailDate = await detailDateEvent.findAll({
                where: {
                    id_event: header.id_event
                }})

            let detailUser = await detailUserInvite.findAll({
                where: {
                    id_event: header.id_event
                }})

            var data={
                id_event:header.id_event,
                event_name:header.event_name,
                desc:header.desc,
                created_at:header.created_at,
                created_by:header.created_by,
                updated_at:header.updated_at,
                link_meeting:header.link_meeting,
                timezone:header.timezone,
                timer:header.timer,
                detailDateEvent:detailDate,
                detailUserInvite:detailUser,
            }


            result.push(data)
        }
        return responseStatus.resOK(res, result);
    } catch (error) {
        console.log(error);
        next(error)
    }
}

controller.createEvent = async (req, res, next) => {

    try {
        console.log(req.body);
        const headerEventData = {
            event_name: req.body.event_name,
            desc: req.body.desc,
            link_meeting: req.body.link_meeting,
            timezone: req.body.timezone,
            timer: req.body.timer,
            created_at: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
        };

        const header =  await headerEvent.create(headerEventData);


        for (const item of req.body.event_date) {
            const detailDateEventData = {
                id_event:header.id_event,
                date_event:item.date,
                created_at: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
            };
            await detailDateEvent.create(detailDateEventData);
        }
        for (const item of req.body.event_user) {
            const detailUserInviteData = {
                id_event:header.id_event,
                user_id:item.user_id,
                created_at: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
            };
            await detailUserInvite.create(detailUserInviteData)
        }

        return responseStatus.resOK(res, '');
    } catch (error) {

        console.log(error);
        next(error)
    }
}

controller.deleteEvent = async (req, res, next) => {

    try {
        await detailUserInvite.destroy({
            where: {
                id_event: req.body.id_event
            },
        });

        await detailDateEvent.destroy({
            where: {
                id_event: req.body.id_event
            },
        });

        await headerEvent.destroy({
            where: {
                id_event: req.body.id_event
            },
        });
        return responseStatus.resOK(res, '');
    } catch (error) {

        console.log(error);
        next(error)
    }
}

//Mobile

controller.getEventMobile = async (req, res, next) => {
    try {
        let data = await headerEvent.findAll()
        return responseStatus.resOK(res, data);
    } catch (error) {
        console.log(error);
        next(error)
    }
}

controller.createEventMobile = async (req, res, next) => {

    try {
        console.log(req.body);
        const headerEventData = {
            event_name: req.body.event_name,
            desc: req.body.desc,
            link_meeting: req.body.link_meeting,
            timezone: req.body.timezone,
            timer: req.body.timer,
            created_at: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
        };

        const header =  await headerEvent.create(headerEventData);


        for (const item of req.body.event_date) {
            const detailDateEventData = {
                id_event:header.id_event,
                date_event:item.date,
                created_at: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
            };
            await detailDateEvent.create(detailDateEventData);
        }
        for (const item of req.body.event_user) {
            const detailUserInviteData = {
                id_event:header.id_event,
                user_id:item.user_id,
                created_at: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
            };
            await detailUserInvite.create(detailUserInviteData)
        }

        return responseStatus.resOK(res, '');
    } catch (error) {

        console.log(error);
        next(error)
    }
}

controller.deleteEventMobile = async (req, res, next) => {

    try {
        await detailUserInvite.destroy({
            where: {
                id_event: req.body.id_event
            },
        });

        await detailDateEvent.destroy({
            where: {
                id_event: req.body.id_event
            },
        });

        await headerEvent.destroy({
            where: {
                id_event: req.body.id_event
            },
        });
        return responseStatus.resOK(res, '');
    } catch (error) {

        console.log(error);
        next(error)
    }
}

module.exports = controller
