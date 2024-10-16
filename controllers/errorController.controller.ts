import AppError from "../utils/appError";
const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err: any) => {
  const value = `${err.errmsg}`.match(/(["'])(\\?.)*?\1/)?.[0] || err.keyValue.name;
  const message = `Duplicate field value: ${value} please use another value`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data ${errors.join(`. `)}`;
  return new AppError(message, 400);
};
const handleJWTError = (err: any) => {
  return new AppError("Invalid token, Please log in again!!", 401);
};
const handleJWTExpiredError = (err: any) => {
  return new AppError("Your token has expired! Please log in again!!", 401);
};
const sendErrorDev = (err: any, res: any) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err: any, res: any) => {
  //Operational, trusted error : send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //programming or other unknown error: don't leak error details to client
  } else {
    //1) log error
    console.error("ERROR", err);
    //2) send generic message
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

export default (err: any, req: any, res: any, next: any) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.message = err.message || "Something went wrong!";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    console.error(error);
    if (error.kind === "ObjectId" || error.name === "CastError") {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (`${err._message}`.includes("Validation")) {
      error = handleValidationErrorDB(error);
    }
    if (error.name === "JsonWebTokenError") {
      error = handleJWTError(error);
    }
    if (error.name === "TokenExpiredError") {
      error = handleJWTExpiredError(error);
    }

    sendErrorProd(error, res);
  }
};
