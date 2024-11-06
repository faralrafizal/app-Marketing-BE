const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  // Create Log for dev
  console.error("ERROR DETECTED :", err.name);
  console.error("Causes - ", err.message);

  if(err.code){
    console.error("Code - ", err.code);
    console.error(err);
  }

  // Copy Error object
  let customError = { ...err };

  // Get error message
  customError.message = err.message;

  // Joi error middleware
  let errorField;

  //Oracledb Timeout NJS-040
  if (err.message.includes("NJS-040") || err.message.includes("connection request timeout. Request exceeded queueTimeout")) {
    const message = `Connection problem. Please try again a sec 🙏`;
    customError = new ErrorResponse(message, 500);

    res.status(customError.statusCode).json({
      code: "0",
      msg: customError.message
    });

    //turn off service
    return process.exit(1);
  }

  // Request Error
  if (err.name === "ReferenceError") {
    const message = `Something went wrong with the server. TODO : please contact the maintainer.`;
    customError = new ErrorResponse(message, 500);
  }

  // SyntaxError on Client JSON
  if (err.name === "SyntaxError") {
    const message = "Failed to take your request, please check your request body / parameter.";
    customError = new ErrorResponse(message, 400);
  }

  // SequelizeDatabaseError
  if (err.name === "SequelizeDatabaseError") {
    if (err.message.includes("ORA-00001: unique constraint")) {
      const message = "Data already exists.";
      customError = new ErrorResponse(message, 400);
    }
    if (err.message.includes("ORA-01722: invalid number")) {
      const message = "Invalid data type inserted, please check your request body.";
      customError = new ErrorResponse(message, 400);
    }
    if (err.message.includes("ORA-02291: integrity constraint")) {
      const message = "Data with inserted id not found.";
      customError = new ErrorResponse(message, 400);
    }
  }

  // ECONNREFUSED from other Services
  if (err.code === "ECONNREFUSED") {
    let message = "Failed to get response from service";

    if (err.config.url) {
      message += `: ${err.config.url}`;
    }

    customError = new ErrorResponse(message, 400);
  }

  // ERROR METHOD from external Services
  if (err.response) {
    let message = err.response.status ? err.response.statusText : "Failed to get response from External service";
    customError = new ErrorResponse(message, 400);
  }

  //Error Timeout
  if (err.message.includes("ORA-12170")) {
    const message = "Network Authentication Required, please check your connection.";
    customError = new ErrorResponse(message, 511);
  }

  //Send JSON response to client
  res.status(customError.statusCode || 500).json({
    code: "0",
    msg: customError.message || "Server Error",
    detail: err,
    errorField,
  });
};

module.exports = errorHandler;
