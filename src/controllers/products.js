import axios from "axios";

import dotenv from "dotenv";
// import products from "../models/Product";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError";
import Product from "../models/Product";
import productSchema from "../validate/product";
dotenv.config();

const { DB_URL } = process.env;
export const getAll = async (req, res, next) => {
  try {
    const {
      _page = 1,
      _limit = 50,
      _sort = 'createdAt',
      _order = 'asc'
    } = reqBody.query
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: ['showTimes']
    }
    const data = await Product.paginate({ destroy: false }, options)

    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No food found!')
    }
    return {
      ...data
    }
  } catch (error) {
    throw error
  }
}
export const getProductByCategory = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // const data = await Product.findById(id)
    // Lấy dữ liệu từ bảng categories khi query data từ bảng Product
    const data = await Product.findById(id)

    if (!data || Object.keys(data).length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No food id found!')
    }
    const categoriesId = data.categoryId
    const relateProduct = await Product.find({
      categoryId: {
        $in: categoriesId
      },
      _id: {
        $ne: id
      }
    }).populate('categoryId', '_id name')

    if (!relateProduct || relateProduct.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No Product found!')
    }
    // console.log(relateProduct)
    const convertDateProduct = relateProduct.map((Product) => {
      const fromDateConvert = convertTimeToCurrentZone(Product.fromDate)
      const toDateConvert = convertTimeToCurrentZone(Product.toDate)
      return {
        ...Product._doc,
        fromDate: fromDateConvert,
        toDate: toDateConvert
      }
    })
    return convertDateProduct
  } catch (error) {
    throw error
  }
}
export const getAllProductHomePage = async (req, res, next) => {
  try {
    const {
      _page = 1,
      _limit = 50,
      _sort = 'createdAt',
      _order = 'asc'
    } = reqBody.query
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: {
        path: 'categoryId',
        select: 'name _id isDeleteable '
      }
    }
    const data = await Product.paginate({ destroy: false }, options)

    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No Products found!')
    }
    return {
      data
    }
  } catch (error) {
    throw error
  }
}
export const searchProduct = async (req, res, next) => {
  try {
    const {
      _page = 1,
      _limit = 9,
      _sort = 'createdAt',
      _order = 'asc',
      q = ''
    } = reqBody.query
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      },
      populate: {
        path: 'categoryId',
        select: 'name _id isDeleteable '
      },
      projection: {
        name: 1,
        categoryId: 1,
        status: 1,
        slug: 1,
        image: 1
      }
    }

    const data = await Product.paginate(
      {
        destroy: false,
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { author: { $regex: q, $options: 'i' } },
          { actor: { $regex: q, $options: 'i' } }
        ]
      },
      options
    )

    if (!data || data.docs.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No Products found!')
    }

    return {
      ...data
    }
  } catch (error) {
    throw error
  }
}

export const getAllSoftDelete = async (req, res, next) => {
  try {
    // const id = reqBody.params.id
    const data = await Product.find(destroy == true)
    // Lấy dữ liệu từ bảng categories khi query data từ bảng Product

    return data
  } catch (error) {
    throw error
  }
}
export const getDetail = async (req, res, next) => {
  try {
    const {id} = req.params.id
    const data = await Product.findById(id)

    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No fodd found!')
    }

    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data
    })
  } catch (error) {
    next(error)
  }
}
export const create = async (req, res, next) => {
  try {
    const body = req.body
    //thêm đường dẫn ảnh vòa body
    let imageUrl
    let cloudGetUrl
    const { error } = productSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    if (req.file) {
      cloudGetUrl = await cloudinary.uploader.upload(req.file.path, {
        folder: 'AVATAR',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
      })
      imageUrl = cloudGetUrl.secure_url
    } else {
      imageUrl =
        'https://phongreviews.com/wp-content/uploads/2022/11/avatar-facebook-mac-dinh-19.jpg'
    }

    // const { prices, ...restBody } = body
    const data = await Movie.create({
      ...restBody,
      ...(cloudGetUrl && { image: imageUrl }),
    })

    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create movie failed!')
    }
    // Tạo ra mảng array của category
    const arrayCategory = data.categoryId
    // Tạo vòng lặp để thêm từng cái product id vào mỗi mảng product của category
    for (let i = 0; i < arrayCategory.length; i++) {
      await Category.findOneAndUpdate(arrayCategory[i], {
        $addToSet: {
          products: data._id
        }
      })
    }
  

    return data
  } catch (error) {
    throw error
  }
}
export const update = async (req, res, next) => {
  try {
    const id = req.params.id
    const body = req.body
    let imageUrl
    let cloudGetUrl
    const { error } = productSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const checkmovie = await Movie.findById(id)
    if (!checkmovie || checkmovie.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Phim không tồn tại')
    }
    if (req.file) {
      cloudGetUrl = await cloudinary.uploader.upload(req.file.path, {
        folder: 'AVATAR',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
      })
      imageUrl = cloudGetUrl.secure_url
    } else {
      imageUrl = body.image
    }
    // check destroy nếu đang xóa mềm thì không thể sửa được bất cứ trường nào
    if (checkmovie.destroy) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Bộ phim này đã bị xóa mềm không thể sửa!'
      )
    }

    // const data = await Movie.findByIdAndUpdate(id, body, { new: true })
    const data = await Movie.findById(id, 'categoryId prices')

    const {...reqbody } = body

    const updateData = await Movie.updateOne(
      { _id: id },
      {
        ...reqbody,
        ...(cloudGetUrl && { image: imageUrl }),
      }
    )

    if (!updateData) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Update movie failed!')
    }

    if (body?.categoryId && body.categoryId.length > 0) {
      const result = findDifferentElements(data.categoryId, body.categoryId)
      // Những id category mới thêm mảng categoryId của movie
      const newCategory = result.filter((cate) => {
        if (body.categoryId.includes(cate)) {
          return cate
        }
      })
      // Những id category bị xóa khỏi mảng categoryId của movie
      const deletedCategoryfromProduct = findDifferentElements(
        newCategory,
        result
      )
      if (newCategory && newCategory.length > 0) {
        await Category.updateMany(
          {
            _id: {
              // tìm ra tất cả những id trong mảng dùng $in
              $in: newCategory
            }
          },
          {
            // Thêm productId vào products trong category nếu có rồi thì ko thêm , chưa có thì mới thêm dùng $addToSet
            $addToSet: {
              products: id
            }
          }
        )
      }
      if (deletedCategoryfromProduct && deletedCategoryfromProduct.length > 0) {
        await Category.updateMany(
          {
            _id: {
              // tìm ra tất cả những id trong mảng dùng $in
              $in: deletedCategoryfromProduct
            }
          },
          {
            // Xóa productId khỏi products trong category thì dùng $pull
            $pull: {
              products: id
            }
          }
        )
      }
    }

    return updateData
  } catch (error) {
    throw error
  }
}

export const softDelete = async (req, res, next) => {
  try {
    const id = req.params.id
    const data = await Product.updateOne(
      { _id: id },
      { destroy: true, status: CANCELLED }
    )
    if (!data) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Soft delete Product failed!')
    }
    return data
  } catch (error) {
    throw error
  }
}
export const restore = async (req, res, next) => {
  try {
    const id = req.params.id
    // check suat chieu
    const checkshowtimes = await Showtimes.find({ ProductId: id })
    const showtime = await checkshowtimes[0]
    if (showtime != undefined) {
      throw new ApiError(StatusCodes.NOT_FOUND, '')
    }
    const data = await Product.updateOne({ _id: id }, { destroy: false, status: COMING_SOON })
    if (!data) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Product restore failed !')
    }
    return data
  } catch (error) {
    throw error
  }
}

export const remove = async (req, res, next) => {
  try {
    const id = req.params.id
    // check suat chieu nếu có thì k xóa dc
    const data = await Product.findOneAndDelete({ _id: id })

    // get all price of Product
    //loop and delete all price of Product
    if (!data) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Delete Product failed!')
    }
    return data
  } catch (error) {
    throw error
  }
}

