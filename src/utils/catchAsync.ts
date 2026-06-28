import { NextFunction, Request, RequestHandler, Response } from "express";
import  HttpStatus from "http-status";


export const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success:false,
        message: "Failed to register",
        error: (error as Error).message
      })
    }
  }
}