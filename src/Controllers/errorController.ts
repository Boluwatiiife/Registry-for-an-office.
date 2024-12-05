import { Request, Response, NextFunction } from "express";
import CustomError from "../Utils/CustomError";

interface CustomErrorType extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  stack?: string;
  keyValue?: { [key: string]: string }; // for duplicate key errors
  errors?: { [key: string]: { message: string } }; // for validation errors
  path?: string; // for castErrors
  value?: string; // for castErrors
  code?: number; // for duplicate key errors
  // name?: string; // for error type identification
}

// Development Error Response
const devErrors = (res: Response, error: CustomErrorType): void => {
  res.status(error.statusCode || 500).json({
    status: error.status || "error",
    message: error.message,
    stackTrace: error.stack,
    error: error.errors,
  });
};

// Production Error Response
const prodError = (res: Response, error: CustomErrorType): void => {
  if (error.isOperational) {
    res.status(error.statusCode || 500).json({
      status: error.status || "error",
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong! please try again",
    });
  }
};

// Error Handlers
const castErrorHandler = (err: CustomErrorType): CustomError => {
  const message = `invalid value ${err.path}: ${err.value}`;
  return new CustomError(message, 400);
};

const validateErrorHandler = (err: CustomErrorType): CustomError => {
  const errors = Object.values(err.errors || {}).map((val) => val.message);
  const errorMessages = errors.join(". ");
  const message = `invalid input data: ${errorMessages}`;
  return new CustomError(message, 400);
};

const handleExpiredJWT = (): CustomError => {
  return new CustomError("JWT has expired, please login again!", 401);
};

const handleJWTError = (): CustomError => {
  return new CustomError("Invalid token, please try again!", 401);
};

// Error Handling Middlewares
export default (
  error: CustomErrorType,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    devErrors(res, error);
  } else if (process.env.NODE_ENV === "production") {
    if (error.name === "CastError") error = castErrorHandler(error);
    if (error.name === "ValidationError") error = validateErrorHandler(error);
    if (error.name === "TokenExpiredError") error = handleExpiredJWT();
    if (error.name === "JsonWebTokenError") error = handleJWTError();

    prodError(res, error);
  }
};
