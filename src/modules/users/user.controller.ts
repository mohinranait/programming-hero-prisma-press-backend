import { NextFunction, Request,  Response } from "express";
import  HttpStatus  from "http-status";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse as  sendResposne } from "../../utils/sendResponse";

const createuser = catchAsync( async(req:Request, res:Response, next:NextFunction) => {
  const payload = req.body;
  const user = await userService.registerUserIntodb(payload);
  sendResposne(res,{
    message:"user register successfull",
    success: true,
    statusCode: HttpStatus.CREATED,
    data:{user}
  })
})


// get profile
const getMyProfile = catchAsync(async (req:Request, res:Response, next:NextFunction) =>{
  
  const user = req.user;


  const profile = await userService.getMyProfileFromDb(user?.id as string )



  sendResposne(res,{
    message:"user register successfull",
    success: true,
    statusCode: HttpStatus.CREATED,
    data:{profile}
  })
})


// update auth user
const updateMyProfile = catchAsync(async (req:Request, res:Response,) => {
  const userId = req.user?.id as string;
  const payload = req.body;
  const user = await userService.updateMyProfileIntoDB(userId,payload)
   sendResposne(res,{
    message:"User profile updated successfull",
    success: true,
    statusCode: HttpStatus.CREATED,
    data:{user}
  })
})


export const userController = {
  createuser,
  getMyProfile,
  updateMyProfile
}