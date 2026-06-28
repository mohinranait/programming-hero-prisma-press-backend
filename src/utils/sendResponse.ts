import { Response } from "express";

type TMeta = {
    page: number;
    limit: number;
    total:number;
  }

interface TResposne<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T,
  meta?: TMeta
}

export const sendResposne = <T>(res: Response, data:TResposne<T>) => {
   return res.status(data.statusCode).json({
    success: data.success ,
    message: data.message,
    statusCode: data.statusCode,
    data: data.data,
    meta: data.meta
  })
}