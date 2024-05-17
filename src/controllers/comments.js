import Comment from '../models/Comment'
import { StatusCodes } from 'http-status-codes'
import commentValidationSchema from '../validate/comment'

export const getAll = async (req, res, next) => {
    try {
        const {
          _page = 1,
          _limit = 10,
          _sort = 'createdAt',
          _order = 'asc'
        } = reqBody.query // Sử dụng req.query thay vì req.body để nhận tham số từ query string
    
        const options = {
          page: _page,
          limit: _limit,
          sort: {
            [_sort]: _order === 'asc' ? 1 : -1
          }
        }
        // const data = await Food.paginate({}, options)
        // const data = await Food.paginate({ isDeleted: false }, options); // Chỉ lấy các thực phẩm chưa bị xóa mềm
        const data = await Comment.paginate({}, options)
    
        if (!data || data.docs.length === 0) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'No comment found!')
        }
        return data
      } catch (error) {
        throw error
      }
}
export const getCommentByMovie = async (req, res, next) => {
    try {
        const {
          _page = 1,
          _limit = 10,
          _sort = 'createdAt',
          _order = 'asc',
          _movieId = ''
        } = reqBody.query // Sử dụng req.query thay vì req.body để nhận tham số từ query string
    
        const options = {
          page: _page,
          limit: _limit,
          sort: {
            [_sort]: _order === 'asc' ? 1 : -1
          },
          populate: {
            path: 'like userId',
            select: 'name avatar'
          }
        }
        // const data = await Food.paginate({}, options)
        // const data = await Food.paginate({ isDeleted: false }, options); // Chỉ lấy các thực phẩm chưa bị xóa mềm
        const data = await Comment.paginate({ movieId: _movieId }, options)
        const plainDocs = data.docs.map((doc) => doc.toObject())
        const comments = plainDocs.map((comment) => {
          return {
            ...comment,
            createdAt: convertTimeToCurrentZone(comment.createdAt)
          }
        })
    
        if (!data || data.docs.length === 0) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'No comment found!')
        }
        return comments
      } catch (error) {
        throw error
      }
}
export const create = async (req, res, next) => {
    try {
        const { empty = false, ...body } = reqBody.body
    
        const { error } = commentValidationSchema.validate(body, {
          abortEarly: true
        })
        if (error) {
          throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
        }
        const data = await Comment.create({
          ...body
        })
        if (!data) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'Create comment failed!')
        }
        return data
      } catch (error) {
        throw error
      }
}

export const deleteComment = async (req, res, next) => {
    try {
        const id = reqBody.params.id
        // Tìm đối tượng Food theo ID trước khi cập nhật
        // const commentCurrent = await Comment.findById(id)
        // if (commentCurrent.comments.length > 0) {
        //   throw new ApiError(
        //     StatusCodes.CONFLICT,
        //     'This comment has sub children. Delete sub children before delete this comment!'
        //   )
        // }
        // Cập nhật trường isDeleted thành true để đánh dấu xóa mềm
        const data = await Comment.findByIdAndDelete(id)
    
        if (!data || Object.keys(data).length == 0) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'Delete comment failed')
        }
        // if (data.parentId !== null) {
        //   await Comment.updateOne(
        //     {
        //       _id: data.parentId
        //     },
        //     {
        //       $pull: {
        //         comments: data._id
        //       }
        //     }
        //   )
        //   return data
        // }
        // await commentRecursive.updateOne(
        //   {
        //     movieId: data.movieId
        //   },
        //   {
        //     $pull: {
        //       comments: data._id
        //     }
        //   }
        // )
        return data
      } catch (error) {
        throw error
      }
}