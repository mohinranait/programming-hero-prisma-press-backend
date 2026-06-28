import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { prisma } from "../lib/prisma";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        role: Role, id: string, email: string
      }
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken ? req.cookies.accessToken : 
     req.headers.authorization?.startsWith("Bearer") ? req.headers.authorization?.split(' ')[1] : req.headers.authorization;

    if (!token) {
      throw new Error("You are not logged in user.")
    }

    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verifiedToken.success) {
      throw new Error(verifiedToken.error)
    }

    const { email, id, role } = verifiedToken.data as JwtPayload;


    if (requiredRoles?.length && !requiredRoles.includes(role)) {
      throw new Error("Forbidden, you don't have permission to access")
    }

    const user = await prisma.user.findUnique({ where: { id, email, role } });
    if (!user) {
      throw new Error("user not found")
    }

    if (user.activeStatus === "BLOCKED") {
      throw new Error("Your account has been blocked. Please contact support")
    }


    req.user = {
      email,
      id,
      role
    }


    next()


  })
}