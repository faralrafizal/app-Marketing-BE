
const formateHoursSceduler = (date, hour) => {

  var t = new Date(date);
  let month = +t.getMonth() + 1
  let day = +t.getDate()


  return t.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day) + ' ' + hour;
}
module.exports = formateHoursSceduler