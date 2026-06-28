import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma"
import { ICreatePostPayload, IUpdatePostPayload } from "./post.interface"


const createPost = async (paylaod: ICreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...paylaod,
      authorId: userId
    }
  })

  return result;
}
const getAllPosts = async () => {
  const posts = await prisma.post.findMany(
    {
      include: {
        author: {
          omit: {
            password: true
          }
        },
        comments: true,
      }
    }
  );
  return posts
}
const getPostById = async (postId: string) => {

  const transactionResult = await prisma.$transaction(
    async (tx) => {
      await tx.post.update(
        {
          where: {id:postId},
          data:{
            views: {
              increment:1,
            }
          }
        },
      );

      const post = await tx.post.findUniqueOrThrow(
        {
          where:{id:postId},
          include:{
            author: {
              omit:{
                password:true,
              }
            },
            comments: {
              where: {
                status: CommentStatus.APPROVED,
              },
              orderBy:{
                createdAt: 'desc'
              }
            },
            _count:{
              select:{
                comments: true,
              }
            }
          }
        }
      )

      return post;
    }
  )

  return transactionResult;

  // await prisma.post.update(
  //   {
  //     where: { id: postId },
  //     data: {
  //       views: {
  //         increment: 1
  //       }
  //     },
  //   }
  // )

  // const post = await prisma.post.findUniqueOrThrow({
  //   where: { id: postId },
  //   include:{
  //     author: {
  //       omit: {
  //         password: true,
  //       }
  //     },
  //     comments: {
  //       where: {status: CommentStatus.APPROVED},
  //       orderBy : {
  //         createdAt: 'desc',
  //       }
  //     },
  //     _count: {
  //       select: {
  //         comments: true,
  //       }
  //     }
  //   }
  // })



  // return post

}
const updatePost = async (payload: IUpdatePostPayload, postId: string, authorId: string, isAdmin: boolean) => {
  const post = await prisma.post.findUniqueOrThrow(
    {
      where: { id: postId },
    }
  )

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You can't owner this post")
  }

  const result = await prisma.post.update(
    {
      where: { id: postId },
      data: {
        ...payload,
      },
      include: {
        author: {
          omit: {
            password: true,
          }
        },
        comments: true,
      }
    }
  )

  return result;
}
const deletePost = async ({ postId, authorId, isAdmin }: { postId: string; authorId: string; isAdmin: boolean }) => {
  const post = await prisma.post.findFirstOrThrow(
    {
      where: { id: postId }
    }
  )

  if (!isAdmin && authorId !== post.authorId) {
    throw new Error("You can't delete this post")
  }


  await prisma.post.delete({ where: { id: postId } })

}

const getPostsStates = async () => {
  const transactionResult = await prisma.$transaction(
    async (tx) => {
      const totalPost = await tx.post.count();
      const publistPosts = await tx.post.count({
        where: {
          status: PostStatus.PUBLISHED,
        }
      });
      
      const draftPosts = await tx.post.count({
        where: {
          status: PostStatus.DRAFT,
        }
      });

      const archivePosts = await tx.post.count({
        where: {
          status: PostStatus.ARCHIVE,
        }
      });

      const comments = await tx.comment.count();

      const totalApprovedComment = await tx.comment.count({
        where: {
          status: CommentStatus.APPROVED
        }
      })

        const totalRejectComment = await tx.comment.count({
        where: {
          status: CommentStatus.REJECT
        }
      })

      const totalPostViewsAggegate =  await tx.post.aggregate({
        _sum: {views:true}
      })

      const totalPostViews = totalPostViewsAggegate._sum.views;
      return {totalPost,publistPosts,draftPosts,totalPostViews, archivePosts, comments, totalApprovedComment, totalRejectComment}

    }
  )

  return transactionResult;
}


const getMyPosts = async (authorId: string) => {
  const posts = await prisma.post.findMany(
    {
      where: { authorId },

      orderBy: {
        createdAt: 'desc',
      },

      include: {
        author: {
          omit: {
            password: true,
          }
        },
        comments: true,
        _count: {
          select: {
            comments: true,
          }
        }
      },

    }
  )

  return posts;
}

export const postService = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsStates,
  getMyPosts
} 