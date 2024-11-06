// const formateTime = (time, isStart) => {
//     // const Time = new Date(time);
//     let event = new Date()
//     let hour = time
//     hour = hour.split(":")
//     if (isStart) {
//         event.setHours(parseInt(hour[0]), parseInt(hour[1]) + 1);
//     } else {
//         event.setHours(parseInt(hour[0]), parseInt(hour[1]));
//     }
//     let Time = new Date(event.getTime())
//     // console.log(data)
//     // console.log(new Date(date.setMinutes(date.getMinutes() + 10)).getTime());
//     let getHours = Time.getHours() < 10 ? `0${Time.getHours()}` : `${Time.getHours()}`
//     let Minutes = Time.getMinutes() < 10 ? `0${Time.getMinutes()}` : `${Time.getMinutes()}`

//     return `${getHours}:${Minutes}`
// }

const formateTime = (time, isStart) => {
    let event = new Date()
    let hour = time
    console.log(hour,"mjdiojdijiji")
    hour = hour.split(":")
    if (isStart) {
        event.setHours(parseInt(hour[0]), parseInt(hour[1]) + 1);
    } else {
        event.setHours(parseInt(hour[0]), parseInt(hour[1]));
    }
    let Time = new Date(event.getTime())

    let getHours = Time.getHours() < 10 ? `0${Time.getHours()}` : `${Time.getHours()}`
    let Minutes = Time.getMinutes() < 10 ? `0${Time.getMinutes()}` : `${Time.getMinutes()}`

    return `${getHours}:${Minutes}`
}


module.exports = formateTime;