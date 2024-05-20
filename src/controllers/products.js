import axios from "axios";

import dotenv from "dotenv";
// import products from "../models/Product";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError";
import Product from "../models/Product";
import productSchema from "../validate/product";
dotenv.config();

const { DB_URL } = process.env;
// export const getAll = async (req, res, next) => {
//   try {
//     // const categoryId = req.params.id;
//     const { id: categoryId } = req.params
//     const {
//       _page = 1,
//       _limit = 50,
//       _sort = 'createdAt',
//       _order = 'asc'
//     } = req.query
//     const options = {
//       page: _page,
//       limit: _limit,
//       sort: {
//         [_sort]: _order === 'asc' ? 1 : -1
//       }
//     }
//     const data = await Product.find({})
//     if (!data || data.length === 0) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'No Food found!')
//     }
//     return res.status(StatusCodes.OK).json({
//       message: 'Success',
//        data
//     })
//   } catch (error) {
//     next(error)
//   }
// }
export const getAll = async (req, res, next) => {
  try {
    const { id: categoryId } = req.params;
    const {
      _page = 1,
      _limit = 50,
      _sort = 'createdAt',
      _order = 'asc'
    } = req.query;

    // Tính toán số phần tử bị bỏ qua (skip) dựa trên trang hiện tại và số lượng phần tử trên mỗi trang
    const skip = (_page - 1) * _limit;

    // Tạo một object options để truy vấn MongoDB
    const options = {
      skip: skip,
      limit: parseInt(_limit), // Chuyển đổi _limit từ string sang number
      sort: {
        [_sort]: _order === 'asc' ? 1 : -1
      }
    };

    // Truy vấn dữ liệu từ cơ sở dữ liệu sử dụng các options đã được tạo
    const data = await Product.find({}, {}, options);

    // Kiểm tra nếu không có dữ liệu được trả về
    if (!data || data.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'No Food found!');
    }

    // Trả về dữ liệu và thông tin phân trang
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data
    });
  } catch (error) {
    next(error);
  }
};
export const getProductByCategory = async (reqBody) => {
  try {
    const id = reqBody.params.id
    // const data = await Product.findById(id)
    // Lấy dữ liệu từ bảng categories khi query data từ bảng Product
    const data = await Product.findById(id)

    if (!data || data.length === 0) {
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
      return {
        ...Product._doc,
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
    } = req.query
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
    } = req.query
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
    const {id} = req.params
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
// export const create = async (req, res, next) => {
//   try {
//     const body = req.body
//     //thêm đường dẫn ảnh vòa body
//     let imageUrl
//     let cloudGetUrl
//     const { error } = productSchema.validate(body, { abortEarly: true })
//     if (error) {
//       throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
//     }
//     if (req.file) {
//       cloudGetUrl = await cloudinary.uploader.upload(req.file.path, {
//         folder: 'AVATAR',
//         allowed_formats: ['jpg', 'png', 'jpeg'],
//         transformation: [{ width: 500, height: 500, crop: 'limit' }]
//       })
//       imageUrl = cloudGetUrl.secure_url
//     } else {
//       imageUrl =
//         'https://phongreviews.com/wp-content/uploads/2022/11/avatar-facebook-mac-dinh-19.jpg'
//     }

//     // const { prices, ...restBody } = body
//     const data = await Product.create({
//     ...body,
//       ...(cloudGetUrl && { image: imageUrl }),
//     })

//     if (!data) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'Create movie failed!')
//     }
//     // // Tạo ra mảng array của category
//     // const arrayCategory = data.categoryId
//     // // Tạo vòng lặp để thêm từng cái product id vào mỗi mảng product của category
//     // for (let i = 0; i < arrayCategory.length; i++) {
//     //   await Category.findOneAndUpdate(arrayCategory[i], {
//     //     $addToSet: {
//     //       products: data._id
//     //     }
//     //   })
//     // }
  

//     return data
//   } catch (error) {
//     throw error
//   }
// }
export const create = async (req, res, next) => {
  try {
    const body = req.body
    const { error } = productSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const data = await Product.create(body)
    if (!data) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create Food failed')
    }
    return res.status(StatusCodes.CREATED).json({
      message: 'Success',
      data: data
    })
  } catch (error) {
    next(error)
  }
}
export const update = async (req, res, next) => {
  try {
    const {id} = req.params
    const body = req.body
    let imageUrl
    let cloudGetUrl
    const { error } = productSchema.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    const checkProduct = await Product.findById(id)
    if (!checkProduct || checkProduct.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Đồ ăn không tồn tại')
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
    // const data = await Product.findOneAndUpdate({_id:id} , body)
    const updateData = await Product.updateOne(
      { _id: id },
      {
        ...body
        // ...(cloudGetUrl && { image: imageUrl }),
      }
    )

    if (!updateData) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Update movie failed!')
    }
    return res.status(StatusCodes.OK).json({
      message: 'Success',
      data: updateData
    })
    // return updateData
  } catch (error) {
    throw error
  }
}

export const softDelete = async (req, res, next) => {
  try {
    const {id} = req.params
    const data = await Product.updateOne(
      { _id: id }
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
    const data = await Product.updateOne({ _id: id })
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

