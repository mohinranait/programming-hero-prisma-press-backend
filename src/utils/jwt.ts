import  Jwt, { JwtPayload, SignOptions }  from "jsonwebtoken"
const createToken = (payload: JwtPayload, secret:string, expiresIn: SignOptions) => {
  return Jwt.sign(payload, secret, expiresIn  )
}


const verifyToken = (token:string, secret: string) => {
  try {
    const verifyToken =  Jwt.verify(token, secret)
    return {
      success: true,
      data: verifyToken,
    }
    
  } catch (error:any) {
    return   {
      success: false,
      error: error.message,
    }
  }
}

export const jwtUtils = {
  createToken,
  verifyToken
}