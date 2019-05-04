const mongoose = require('mongoose')

const { Schema } = mongoose

const jobsheetSchema = new Schema(
  {
    customerID: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
    addressID: {
      type: Schema.Types.ObjectId,
      ref: 'Address',
    },
    features: String,
    number: {
      type: Number,
      index: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)


const Jobsheet = mongoose.model('Jobsheet', jobsheetSchema)

module.exports = Jobsheet
