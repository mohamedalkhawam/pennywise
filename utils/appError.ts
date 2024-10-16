class AppError extends Error {
  statusCode: any;
  status: string;
  isOperational: boolean;
  errorCode: number | undefined;
  type: string | undefined;
  constructor(
    message: any,
    statusCode: any,
    errorCode: number | undefined = undefined,
    type: string | undefined = undefined
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    if (errorCode) this.errorCode = errorCode;
    if (type) this.type = "Auth";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
export default AppError;
