import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { postService } from "./post.service";
import HttpStatus from "http-status";
import { sendResposne } from "../../utils/sendResponse";


const createPost = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user?.id
  const result = await postService.createPost(payload, userId as string)

  sendResposne(res, {
    message: "Post Created",
    success: true,
    statusCode: HttpStatus.CREATED,
    data: { result }
  })

})
const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const posts = await postService.getAllPosts()
  sendResposne(res, {
    message: "Success",
    success: true,
    statusCode: HttpStatus.OK,
    data: { posts }
  })
})
const getPostsStates = catchAsync(async (req: Request, res: Response) => {

  const states = await postService.getPostsStates();

  sendResposne(res, {
    message: "Success",
    success: true,
    statusCode: HttpStatus.OK,
    data: states
  })

})
const getMyPosts = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user?.id as string;
  const posts = await postService.getMyPosts(authorId)
  sendResposne(res, {
    message: "Success",
    success: true,
    statusCode: HttpStatus.OK,
    data: { posts }
  })
})
const getPostById = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.postId as string;
  if (!postId) {
    throw new Error("Post id required")
  }
  const post = await postService.getPostById(postId)

  sendResposne(res, {
    message: "Success",
    success: true,
    statusCode: HttpStatus.OK,
    data: post
  })
})
const updatePost = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const postId = req.params.postId as string;
  const authorId = req.user?.id as string;
  const isAdmin = req.user?.role === "ADMIN";

  if (!postId) {
    throw new Error("Post ID is required")
  }

  const result = await postService.updatePost(payload, postId, authorId, isAdmin)

  sendResposne(res, {
    message: "Updated Success",
    success: true,
    statusCode: HttpStatus.OK,
    data: result
  })

})
const deletePost = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.postId as string;
  const authorId = req.user?.id as string;
  const isAdmin = req.user?.role === "ADMIN";
  if (!postId) {
    throw new Error("Post ID is required")
  }

  await postService.deletePost({ postId, authorId, isAdmin })
  sendResposne(res, {
    message: "Deleted Success",
    success: true,
    statusCode: HttpStatus.OK,
    data: null
  })

})


export const postController = {
  createPost,
  getAllPosts,
  getPostsStates,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost
} 