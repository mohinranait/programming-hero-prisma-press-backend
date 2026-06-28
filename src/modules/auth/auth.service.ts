import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUser } from "./auth.interface"
import Jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;

  // handle error automatic  
  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  })

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error("Password is incorrect")
  }

  const tokenPayload = {
    id: user.id,
    email: user?.email,
    role: user.role,
  }

  const accessToken = jwtUtils.createToken(
    tokenPayload,
    config.jwt_access_secret,
    { expiresIn: config.jwt_access_expireds_in } as SignOptions
  )

  const refreshToken = jwtUtils.createToken(
    tokenPayload,
    config.jwt_refresh_secret,
    { expiresIn: config.jwt_refresh_expireds_in } as SignOptions
  )

  return { accessToken, refreshToken };
}


const refreshToken = async (refreshToken: string) => {
  const verifyRefreshToken = jwtUtils.verifyToken(refreshToken, config.jwt_refresh_secret);

  if (!verifyRefreshToken.success) {
    throw new Error(verifyRefreshToken.error)
  }

  const { id } = verifyRefreshToken.data as JwtPayload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id }
  })

  if (user.activeStatus === 'BLOCKED') {
    throw new Error("User are blocked. please contact support")
  }

  const jwtPayload = {
    id,
    email: user.email,
    role: user.role,
  }

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    { expiresIn: config.jwt_access_expireds_in } as SignOptions
  )


  return {accessToken}


}


export const authService = {
  loginUser,
  refreshToken
}