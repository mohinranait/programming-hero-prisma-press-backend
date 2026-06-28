import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { authService } from "./auth.service";
import { sendResposne } from "../../utils/sendResponse";
import HttpStatus from "http-status";

const loginUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;
  const { accessToken, refreshToken } = await authService.loginUser(payload)
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours or 1 day
  })

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  })
  sendResposne(res, {
    message: "Login success",
    success: true,
    statusCode: HttpStatus.OK,
    data: { accessToken, refreshToken }
  })
})


const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  const {accessToken} = await authService.refreshToken(refreshToken)

   res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours or 1 day
  })
  
  sendResposne(res,{
    message:"Token refreshed success",
    success: true,
    statusCode: HttpStatus.OK,
    data: {accessToken}
  })
})


export const authController = {
  loginUser,
  refreshToken,
}