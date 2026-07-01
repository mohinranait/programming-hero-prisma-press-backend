import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma"
import { ICreatePostPayload, IPostQuery, IUpdatePostPayload } from "./post.interface"


const createPost = async (paylaod: ICreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...paylaod,
      authorId: userId
    }
  })

  return result;
}



const getAllPosts = async (query:IPostQuery) => {

  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ?  Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : 'createdAt';
  const sortOrder = query.sortOrder ? query.sortOrder : "desc"

  const andConditions: PostWhereInput[] = []

  if(query.searchTerm){
    andConditions.push({
      OR:[
        {
          title: {
            contains: query.searchTerm,
            mode: 'insensitive'
          },
        },
        {
          content: {
            contains: query.searchTerm,
            mode: 'insensitive'
          }
        }
      ]
    })
  }

  if(query.title){
    andConditions.push({
      title: query.title,
    })
  }
  if(query.content){
    andConditions.push({
      content: query.content,
    })
  }

  if(query.authorId){
    andConditions.push({
      authorId: query.authorId  
    })
  }


  if(query.isFeatured){
    andConditions.push({
      isFeatured: Boolean(query.isFeatured)
    })
  }

  if(query.tags){
    andConditions.push({
      tags: {
        hasSome: query.tags as string[]
      }
    })
  }

  if(query.status){
    andConditions.push({
      status: query.status
    })
  }

  const posts = await prisma.post.findMany(
    {

      // Searching with AND Operator
      // where:{
      //   AND:[
      //     {
      //       title: "",
      //     },
      //      {
      //       content: "",
      //     },
      //     {
      //       tags: {
      //         has:'ts'
      //       }
      //     }
      //   ]
      // },

      // Searching / partial search with OR operator
      // where: {
      //   OR: [
      //     {
      //       title: {
      //         contains: "Ronaldo",
      //         mode: 'insensitive'
      //       }
      //     },
      //     {
      //       content: {
      //         contains: "search text",
      //         mode: 'insensitive'
      //       }
      //     }
      //   ]
      // },



      // combining search and filtering
      // where:{
      //   AND:[
      //     {
      //       OR: [
      //         {
      //           title: {
      //             contains: "ron",
      //             mode: 'insensitive'
      //           }
      //         },
      //          {
      //           title: {
      //             contains: "ron",
      //             mode: 'insensitive'
      //           }
      //         }
      //       ]
      //     },
      //     {
      //       tags: {
      //         has: 'tag1'
      //       }
      //     }
         
      //   ]
      // },

      // without and conditions 
      // where: {
      //   AND: [
      //     query.searchTerm ? {
      //       OR:[
      //         {title: {contains: query.searchTerm, mode: 'insensitive'}},
      //         {content: {contains: query.searchTerm, mode: 'insensitive'}},
      //       ]
      //     } : {},
      //     query.title ? { title: query.title  } : {},
      //     query.content ? { title: query.content  } : {},
      //   ]
      // },


      // with and condistions
      where: {
        AND: andConditions,
      },


      include: {
        author: {
          omit: {
            password: true
          }
        },
        comments: true,
      },
      take:limit,
      skip: skip,
      orderBy:{
        [sortBy]: [sortOrder],
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
          where: { id: postId },
          data: {
            views: {
              increment: 1,
            }
          }
        },
      );

      const post = await tx.post.findUniqueOrThrow(
        {
          where: { id: postId },
          include: {
            author: {
              omit: {
                password: true,
              }
            },
            comments: {
              where: {
                status: CommentStatus.APPROVED,
              },
              orderBy: {
                createdAt: 'desc'
              }
            },
            _count: {
              select: {
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

      const totalPostViewsAggegate = await tx.post.aggregate({
        _sum: { views: true }
      })

      const totalPostViews = totalPostViewsAggegate._sum.views;
      return { totalPost, publistPosts, draftPosts, totalPostViews, archivePosts, comments, totalApprovedComment, totalRejectComment }

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