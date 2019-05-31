const mongoose = require('mongoose')

const { Schema } = mongoose

const paymentSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    quoteID: {
      type: Schema.Types.ObjectId,
      index: true,
      ref: 'Quote',
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Payment = mongoose.model('Payment', paymentSchema)

module.exports = Payment
