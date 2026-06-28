import bcrypt from "bcryptjs"
import { prisma } from "../../lib/prisma"
import config from "../../config"
import { RegisterUserPayload } from "./user.interface"




const registerUserIntodb = async (payload:RegisterUserPayload) => {
    const {name,email,password,profilePhoto} = payload
   const isUserExists = await prisma.user.findUnique({
      where: {email}
    })
    if(isUserExists){
      throw new Error("User already exists")
    }

    // has pas
    const hasPass = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds))

    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hasPass,
        profile:{
          create:{
            profilePhoto
          }
        }
      }
    })

    // await prisma.profile.create({
    //   data:{
    //     profilePhoto,
    //     userId: createdUser.id
    //   }
    // })


    const user = await prisma.user.findUnique({
      where: {
        id: createdUser.id,
        email: createdUser.email || email,
      },
      omit:{
        password: true,
      },
      include:{profile:true}
    })
    return user
}


const getMyProfileFromDb = async (userId:string) => {
  const user = await prisma.user.findUnique({
    where:{id:userId},
    omit:{
      password: true,
    },
    include:{
      profile: true,
    }
  })

  return user;

}


const updateMyProfileIntoDB = async (usreId:string, payload:any) => {
  const {name, email, profilePhoto, bio} = payload;
  const updatedUser = await prisma.user.update({
    where:{id:usreId},
    data:{
      name,
      email, 
      profile:{
        update:{
          profilePhoto,
          bio
        }
      }
    },
    omit:{
      password: true,
    },
    include:{
      profile:true,
    }
  })

  return updatedUser
}

export const userService = {
  registerUserIntodb,
  getMyProfileFromDb,
  updateMyProfileIntoDB,
}