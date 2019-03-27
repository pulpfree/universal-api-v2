const mongoose = require('mongoose')

const { Schema } = mongoose

const jobsheetOtherSchema = new Schema(
  {
    jobsheetID: {
      type: Schema.Types.ObjectId,
      ref: 'Jobsheet',
    },
    costs: {
      extendTotal: Number,
      extendUnit: Number,
    },
    description: {
      required: true,
      trim: true,
      type: String,
    },
    product: String,
    qty: {
      required: true,
      type: Number,
    },
    rooms: Array,
    specs: {
      options: String,
      location: String,
    },
  },
  {
    collection: 'jobsheet-other',
    timestamps: true,
  }
)

const JobsheetOther = mongoose.model('JobsheetOther', jobsheetOtherSchema)

module.exports = JobsheetOther
