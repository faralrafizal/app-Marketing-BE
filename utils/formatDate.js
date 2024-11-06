const moment = require("moment");

const formatDate = (d, format) => {
  let exclude = ["Invalid date", "-"];
  let result = null;
  let formatInput = "";

  if(!d || exclude.includes(d)) return result;

  if(/^[0-9]{2}-[0-9]{2}-[0-9]{4} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{1,4}$/.test(d)){
    formatInput = "DD-MM-YYYY HH:mm:ss.ms";
  }else if(/^[0-9]{2}-[0-9]{2}-[0-9]{4} [0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(d)){
    formatInput = "DD-MM-YYYY HH:mm:ss";
  }else if(/^[0-9]{2}-[0-9]{2}-[0-9]{4} [0-9]{2}:[0-9]{2}$/.test(d)){
    formatInput = "DD-MM-YYYY HH:mm";
  }else if(/^[0-9]{2}-[0-9]{2}-[0-9]{4}$/.test(d)){
    formatInput = "DD-MM-YYYY";
  }

  if(formatInput){
    result = moment(d, formatInput);
    if(!result._isValid){
      return null;
    }
  }else if(moment(d)._isValid){
    result = moment(d);
  }else{
    return null;
  }

  if(format === "time"){
    result = new Date(result.format()).getTime()
  }else{
    if(format){
      result = result.format(format);
    }else{
      result = new Date(result.format('YYYY-MM-DD HH:mm:ss'));
    }
  }

  return result;
}

module.exports = formatDate;