import { Request, Response, NextFunction } from "express";

// async function handler
type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const asyncErrorHandler = (func: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch((err) => next(err));
  };
};

export default asyncErrorHandler;
