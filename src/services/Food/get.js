/* eslint-disable no-useless-catch */
import Food from '../../model/Food'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { v2 as cloudinary } from 'cloudinary'

const checkImageExists = async (public_id) => {
  // console.log('public_id:', public_id);
  try {
    const result = await cloudinary.api.resource(public_id)
    return result ? true : false
  } catch (error) {
    // console.log('Error checking image:', error.message);
    return false
  }
}

export const getAllService = async (reqBody) => {
  try {
    // const {
    //   _sort = 'createdAt',
    //   _order = 'asc',
    //   includeDeleted // Thêm tham số này để kiểm tra query parameter
    // } = reqBody.query; // Sử dụng req.query thay vì req.body để nhận tham số từ query string

    // const queryCondition = includeDeleted === 'true' ? {} : { isDeleted: false }

    // const options = {
    //   sort: {
    //     [_sort]: _order === 'asc' ? 1 : -1
    //   }
    // }
    // const data = await Food.paginate({}, options)
    // const data = await Food.paginate({ isDeleted: false }, options); // Chỉ lấy các thực phẩm chưa bị xóa mềm
    const data = await Food.find({ isDeleted: false })

    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No food found!')
    }
    return data
  } catch (error) {
    throw error
  }
}
export const getFoodDestroyService = async (reqBody) => {
  try {
    // const data = await Food.paginate({}, options)
    // const data = await Food.paginate({ isDeleted: false }, options); // Chỉ lấy các thực phẩm chưa bị xóa mềm
    const data = await Food.find({ isDeleted: true })

    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No food found!')
    }
    return data
  } catch (error) {
    throw error
  }
}

export const getOneService = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // const data = await Food.findById(id)
    // const data = await Food.findOne({ _id: id, isDeleted: false }); // Kiểm tra thêm điều kiện không bị xóa mềm
    const { includeDeleted } = reqBody.query // lấy tham số includeDeleted từ query string
    const queryCondition =
      includeDeleted === 'true' ? { _id: id } : { _id: id, isDeleted: false }
    const data = await Food.findOne(queryCondition)
    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Not food found!')
    }
    return data
  } catch (error) {
    throw error
  }
}
