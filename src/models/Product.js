// import { array, number } from 'joi'
import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    price: {
        type: Number,
        required: true
      },
    image: {
      type: String,
      required: false
      // default: ''
    },
    categoryId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }
    ],
    desc: {
      type: String,
      required: true
    },
    destroy: {
      type: Boolean,
      default: false
    }
  },
  { versionKey: false, timestamps: true, strictPopulate: false }
)

// productSchema.pre('findOneAndDelete', async function (next) {
//   try {
//     // Lấy model Product từ biến đã importc
//     const Category = mongoose.model('Category')
//     const Movie = mongoose.model('Movie')
//     // Lấy điều kiện tìm kiếm hiện tại của câu lệnh , xác định category
//     const filter = this.getFilter()
//     // Tìm sản phẩm bị xóa và lấy ra mảng category của sản phẩm bị xóa
//     const { categoryId } = await Movie.findOne(
//       { _id: filter._id },
//       { categoryId: 1 }
//     )

//     if (!categoryId && categoryId.length === 0) return
//     // Xóa sản phẩm trong mảng sản phẩm của từng category
//     for (let i = 0; i < categoryId.length; i++) {
//       await Category.findByIdAndUpdate(
//         { _id: categoryId[i] },
//         { $pull: { products: filter._id } }
//       )
//     }

//     next()
//   } catch (error) {
//     next(error)
//   }
// })
// productSchema.pre('save', async function (next) {
//   try {
//     const Product = mongoose.model('Product')
//     // Kiểm tra xem có phim nào khác có cùng tên không
//     const existingProduct = await Product.findOne({ name: this.name })
//     if (existingProduct) {
//       const error = new Error('Tên Đồ Ăn đã tồn tại')
//       return next(error)
//     }
//     next()
//   } catch (error) {
//     next(error)
//   }
// })
productSchema.plugin(mongoosePaginate)
// productSchema.index({ name: 1 }, { unique: true })
export default mongoose.model('Product', productSchema)
