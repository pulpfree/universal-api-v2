const mongoose = require('mongoose')

const { Schema } = mongoose

const jobsheetWindowSchema = new Schema(
  {
    jobsheetID: {
      type: Schema.Types.ObjectId,
      ref: 'Jobsheet',
      required: true,
    },
    productID: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    costs: {
      discountAmount: { default: null, type: Number },
      discounted: { default: 0.00, type: Number },
      extendTotal: { default: null, type: Number },
      extendUnit: { default: null, type: Number },
      install: { default: 0.00, type: Number },
      installType: { default: 0.00, type: Number },
      netUnit: { default: 0.00, type: Number },
      options: { default: 0.00, type: Number },
      trim: { default: 0.00, type: Number },
      window: { default: 0.00, type: Number },
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
    rooms: Array,
    specs: {
      installType: String,
      options: String,
      overSize: { default: null, type: Number },
      sqft: Number,
      trim: String,
    },
  },
  {
    collection: 'jobsheet-wins',
    timestamps: true,
  }
)

jobsheetWindowSchema.method('calcSizes', () => {
  let fracW = 0
  let fracH = 0
  let rd

  if (this.dims.height.fraction && this.dims.height.fraction.length) {
    const frac = this.dims.height.fraction
    fracH = parseInt(frac[0], 10) / parseInt(frac[2], 10)
  }
  this.dims.height.decimal = parseFloat(parseInt(this.dims.height.inch, 10) + fracH)
  rd = Math.ceil(this.dims.height.decimal)
  if (rd % 2 !== 0) {
    rd += 1
  }
  this.dims.height.round = rd

  if (this.dims.width.fraction && this.dims.width.fraction.length) {
    const frac = this.dims.width.fraction
    fracW = parseInt(frac[0], 10) / parseInt(frac[2], 10)
  }
  this.dims.width.decimal = parseFloat(parseInt(this.dims.width.inch, 10) + fracW)
  rd = Math.ceil(this.dims.width.decimal)
  if (rd % 2 !== 0) {
    rd += 1
  }
  this.dims.width.round = rd

  const sqft = this.dims.width.round * this.dims.height.round / 144
  this.specs.sqft = Math.ceil(sqft)
})

const JobsheetWindow = mongoose.model('JobsheetWindow', jobsheetWindowSchema)

module.exports = JobsheetWindow
