const moment = require("moment");

module.exports = function(){
  String.prototype.localeToTime = function(){
    return new Date(moment(this,"DD-MM-YYYY").format("YYYY-MM-DD")).getTime();
  }
  String.prototype.localeToDate = function(){
    return new Date(moment(this,"DD-MM-YYYY").format("YYYY-MM-DD"));
  }
  String.prototype.toLocaleString = function(){
    return moment(this).format("DD-MM-YYYY");
  }
  Date.prototype.toLocaleString = function(){
    return moment(this).format("DD-MM-YYYY");
  }
  Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }
  Date.prototype.addHours = function(h) {
    var date = new Date(this.valueOf());
    date.setTime(date.getTime() + (h*60*60*1000));
    return date;
  }
}