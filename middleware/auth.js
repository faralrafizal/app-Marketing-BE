const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");

exports.protect = async (req, res, next) => {
  const { authorization } = req.headers;
  console.log(authorization, "from fe")

  let token;

  // token from header
  if (authorization && authorization.startsWith("Bearer")) {
    token = authorization.split(" ")[1];
  }
  console.log(token, "TOKEENNN6")
  // token from cookie
  // else if (req.cookies.token) {
  // 	token = req.cookies.token;
  // }

  if (!token) {
    return next(new ErrorResponse("No Authorization", 401));
  }

  try {
    const decode = jwt.verify(token, process.env.JWSECRET);

    console.log(decode, "decodeeee")

    req.id_profile = decode.id_profile
    req.username = decode.username
    req.position = decode.position
    req.email = decode.email
    req.id_role = decode.id_role
    req.company = decode.company
    req.token = token
    req.role_level = decode.role_level
    //req.role_access = decode.role_access
    
    next();
  } catch (error) {
    console.error(error);
    return next(new ErrorResponse("Not Authorized to access this route", 401));
  }
};

exports.authorize = (objectRoute) => {
  return async (req, res, next) => {
    try {
      //find object matches with this route
      let authorized = req.accessList.includes(objectRoute.toUpperCase());

      //if there's no match
      if (!authorized) {
        // return next(new ErrorResponse(`Not Authorized to access service`, 401));
      }

      next();
    } catch (error) {
      return next(new ErrorResponse("Error to access this service", 401));
    }
  };
};
