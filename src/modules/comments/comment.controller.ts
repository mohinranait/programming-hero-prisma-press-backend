import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";

const moderateComment = catchAsync(async (req: Request, res: Response) => { })
const deleteComment = catchAsync(async (req: Request, res: Response) => { })
const updateComment = catchAsync(async (req: Request, res: Response) => { })
const getCommentById = catchAsync(async (req: Request, res: Response) => { })
const getCommentByAuthorId = catchAsync(async (req: Request, res: Response) => { })
const createComment = catchAsync(async (req: Request, res: Response) => { })


export const commentController = {
  moderateComment,
  deleteComment,
  updateComment,
  getCommentById,
  getCommentByAuthorId,
  createComment
}