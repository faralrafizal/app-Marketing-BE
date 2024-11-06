const formatDateMonth = (date) => {
  var month = ['Jan', 'Feb', 'March', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
  var t = new Date(date);
  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  day = weekday[t.getDay()];
  return day + ", " + t.getDate() + ' ' + month[t.getMonth()] + ' ' + t.getFullYear();
}
module.exports = formatDateMonth
