import cookieParser from "cookie-parser";
import express, { Application, Request,  Response } from "express";
import cors from 'cors';
import config from "./config";
import { prisma } from "./lib/prisma";
import { userRoutes } from "./modules/users/user.route";
import { authRoutes } from "./modules/auth/auth.routes";
import { postRoutes } from "./modules/posts/post.route";
import { commentRoutes } from "./modules/comments/comment.route";
const app : Application = express()

app.use(cors({
  origin: config.app_url,
  credentials:true,
}))
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


app.get('/', async (req: Request,res:Response) => {
  const user  = await prisma.user.findMany();
  console.log({user});
  
  res.send("Hello word")
})

app.use('/api/', userRoutes)

app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)


export default app;