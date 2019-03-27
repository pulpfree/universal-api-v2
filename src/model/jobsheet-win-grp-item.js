const mongoose = require('mongoose')

const { Schema } = mongoose

const itemSchema = new Schema(
  {
    costs: {
      extendUnit: { default: null, type: Number },
      extendTotal: { default: null, type: Number },
    },
    dims: {
      height: {
        decimal: Number,
        fraction: String,
        inch: { required: true, type: Number },
        overSize: { default: null, type: Number },
        round: Number,
        underSize: { default: null, type: Number },
      },
      width: {
        decimal: Number,
        fraction: String,
        inch: { required: true, type: Number },
        overSize: { default: null, type: Number },
        round: Number,
        underSize: { default: null, type: Number },
      },
    },
    qty: {
      required: true,
      type: Number,
    },
    product: {
      type: Object,
      ref: 'Product',
    },
    productID: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    specs: {
      extendSqft: Number,
      options: String,
      overSize: { default: null, type: Number },
      sqft: Number,
    },
  },
  {
    timestamps: true,
  }
)

const JobsheetWindowGroupItem = mongoose.model('JobsheetWindowGroupItem', itemSchema)

module.exports = JobsheetWindowGroupItem
