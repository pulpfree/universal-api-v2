const mongoose = require('mongoose')

const { Schema } = mongoose

const quoteSchema = new Schema(
  {
    closed: {
      default: false,
      type: Boolean,
    },
    customerID: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    deposit: Boolean,
    discount: {
      description: String,
      discount: Number,
      tax: Number,
      subtotal: Number,
      total: Number,
    },
    features: String,
    invoiced: {
      default: false,
      type: Boolean,
    },
    items: {
      group: Array,
      other: Array,
      window: Array,
    },
    itemCosts: {
      group: Number,
      other: Number,
      subtotal: Number,
      window: Number,
    },
    itemSummary: {
      group: {},
      other: {},
      window: {},
    },
    jobsheetID: {
      ref: 'Jobsheet',
      required: true,
      type: Schema.Types.ObjectId,
    },
    number: {
      type: Number,
      index: true,
      required: true,
    },
    quotePrice: {
      outstanding: {
        type: Number,
        default: 0.00,
      },
      payments: {
        type: Number,
        default: 0.00,
      },
      subtotal: Number,
      tax: Number,
      total: Number,
    },
    version: {
      default: 0,
      type: Number,
    },
  },
  {
    timestamps: true,
  }
)

const Quote = mongoose.model('Quote', quoteSchema)

module.exports = Quote
