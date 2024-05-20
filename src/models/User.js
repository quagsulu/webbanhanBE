import mongoose from 'mongoose' // Erase if already required
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
    }
    ,
    mobile: {
      type: Number,
      // default : 1,
    },
    password: {
      type: String,
      required: true
    },
    confirmPassword: {
      type: String,
      required: true
    },
    oldPassword: {
      type: String
    },
    avatar: {
      type: String,
      default: ''
    },
    cart: [
      {
        product: { type: mongoose.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        color: String,
        total: Number
      }
    ],
    address: {
      type: String,
      default: 'Chưa cập nhật'
    },
    age: {
      type: Number,
      default: 0
    },
    sex: {
      type: String,
      enum: ['Nam', 'Nữ']
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    refreshToken: {
      type: String
    },
    passwordChangedAt: {
      type: String
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: String
    },
    status: {
      type: String,
      default: 'Active'
    }
  },
  {
    timestamps: true, versionKey: false,
  }
)

export default mongoose.model('User', userSchema)
