
import {  Router } from "express";
import { userController } from "./user.controller";

import { Role } from "../../../generated/prisma/enums";

import { auth } from "../../middleware/auth";



const router = Router();


router.post('/users/register', userController.createuser)
router.get('/users/me', auth(Role.ADMIN,Role.AUTHOR, Role.USER), userController.getMyProfile)
router.put("/users/my-profile", auth(Role.ADMIN,Role.AUTHOR, Role.USER), userController.updateMyProfile )

export const userRoutes = router;


