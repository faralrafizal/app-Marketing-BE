
const responseStatus = {};

responseStatus.code = {
  resOK: 200,
  resCreated: 201, //for create
  resAccepted: 202, //for delete / put
  resBadRequest: 400,
  resUnauthorized: 401, //for with jwt but token not match
  resForbidden: 403, //for no jwt
  resNotFound: 404,
  resMethodNotAllowed: 405,
  resNotAcceptable: 406,
  resInternalServerError: 500,
  resServiceUnavailable: 503
};
//
responseStatus.resDataNotFound = (res, message, custom) =>
  res.status(responseStatus.code.resDataNotFound).send({
    responseCode: responseStatus.code.resDataNotFound,
    code: 0,
    msg: message,
  });
responseStatus.resDataExist = (res, message, custom) =>
  res.status(responseStatus.code.resDataExist).send({
    responseCode: responseStatus.code.resDataExist,
    code: 0,
    msg: message,
  });
responseStatus.resDataUnauthorized = (res, message, custom) =>
  res.status(responseStatus.code.resDataUnauthorized).send({
    responseCode: responseStatus.code.resDataUnauthorized,
    code: 0,
    msg: message,
  });
responseStatus.resDataNotAcceptable = (res, message, custom) =>
  res.status(responseStatus.code.resDataNotAcceptable).send({
    responseCode: responseStatus.code.resDataNotAcceptable,
    code: 0,
    msg: message,
  });
responseStatus.resDataRequired = (res, message, custom) =>
  res.status(responseStatus.code.resDataRequired).send({
    responseCode: responseStatus.code.resDataRequired,
    code: 0,
    msg: message,
  });
responseStatus.resDataConstraint = (res, message, custom) =>
  res.status(responseStatus.code.resDataConstraint).send({
    responseCode: responseStatus.code.resDataConstraint,
    code: 0,
    msg: message,
  });
//
responseStatus.resOK = (res, result, lang) =>
  res.status(responseStatus.code.resOK).send({
    responseCode: responseStatus.code.resOK,
    code: 1,
    msg: lang === "en" ? "Success Data" : "Data sukses",
    responseResult: result,
  });
responseStatus.resCreated = (res, result, lang) =>
  res.status(responseStatus.code.resCreated).send({
    responseCode: responseStatus.code.resCreated,
    code: 1,
    msg: lang === "en" ? "Created" : "Data sukses di buat",
    responseResult: result,
  });
responseStatus.resAccepted = (res, message, result) =>
  res.status(responseStatus.code.resAccepted).send({
    responseCode: responseStatus.code.resAccepted,
    code: 1,
    msg: message,
    responseResult: result,
  });
responseStatus.resBadRequest = (res, message) =>
  res.status(responseStatus.code.resBadRequest).send({
    responseCode: responseStatus.code.resBadRequest,
    code: 0,
    msg: message,
  });
responseStatus.resUnauthorized = (res, lang) =>
  res.status(responseStatus.code.resUnauthorized).send({
    responseCode: responseStatus.code.resUnauthorized,
    code: 0,
    msg: lang === "en" ? "Unauthorized!" : "Tidak di izinkan mengakses",
  });
responseStatus.resForbidden = (res, lang) =>
  res.status(responseStatus.code.resForbidden).send({
    responseCode: responseStatus.code.resForbidden,
    code: 0,
    msg: "No token provided!",
  });
responseStatus.resNotFound = (res, message, custom) =>
  res.status(responseStatus.code.resNotFound).send({
    responseCode: responseStatus.code.resNotFound,
    code: 0,
    msg: message,
  });
responseStatus.resMethodNotAllowed = (res, message) =>
  res.status(responseStatus.code.resMethodNotAllowed).send({
    responseCode: responseStatus.code.resMethodNotAllowed,
    code: 0,
    msg: message,
  });
responseStatus.resNotAcceptable = (res, message) =>
  res.status(responseStatus.code.resNotAcceptable).send({
    responseCode: responseStatus.code.resNotAcceptable,
    code: 0,
    msg: message,
  });
responseStatus.resInternalServerError = (res, message) =>
  res.status(responseStatus.code.resInternalServerError).send({
    responseCode: responseStatus.code.resInternalServerError,
    code: 0,
    msg: message,
  });
responseStatus.resServiceUnavailable = (res, message) =>
  res.status(responseStatus.code.resServiceUnavailable).send({
    responseCode: responseStatus.code.resServiceUnavailable,
    code: 0,
    msg: message,
  });

module.exports = responseStatus;
