const mongoose = require('mongoose')

const { Schema } = mongoose

const productSchema = new Schema(
  {
    maxHeight: Number,
    maxWidth: Number,
    minHeight: Number,
    minWidth: Number,
    name: String,
    premium: {
      cost: Number,
      oversizeLimit: Number,
    },
    sizeCost: {
      2: Number,
      3: Number,
      4: Number,
      5: Number,
      6: Number,
      7: Number,
      8: Number,
      9: Number,
      10: Number,
      11: Number,
      12: Number,
      18: Number,
    },
  },
  {
    timestamps: true,
  }
)

const Product = mongoose.model('Product', productSchema)

module.exports = Product
