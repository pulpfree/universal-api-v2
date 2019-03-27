/* eslint no-underscore-dangle: 0 */
const mongoose = require('mongoose')

const { Schema } = mongoose

const JobsheetWindowGroupItem = require('./jobsheet-win-grp-item')

require('./group-type')

const jobsheetWindowGroupSchema = new Schema(
  {
    jobsheetID: {
      type: Schema.Types.ObjectId,
      ref: 'Jobsheet',
    },
    costs: {
      discountAmount: { default: null, type: Number },
      discounted: { default: null, type: Number },
      extendTotal: { default: 0.00, type: Number },
      extendUnit: { default: 0.00, type: Number },
      install: { default: 0.00, type: Number },
      installType: { default: 0.00, type: Number },
      netUnit: { default: 0.00, type: Number },
      options: { default: 0.00, type: Number },
      trim: { default: 0.00, type: Number },
      windows: { default: 0.00, type: Number },
    },
    dims: {
      height: {
        decimal: Number,
        diff: { default: 0, type: Number },
        fraction: String,
        inch: { default: 0, type: Number },
      },
      width: {
        decimal: Number,
        diff: { default: 0, type: Number },
        fraction: String,
        inch: { default: 0, type: Number },
      },
    },
    items: [JobsheetWindowGroupItem.schema],
    qty: {
      type: Number,
      default: 1,
    },
    rooms: Array,
    specs: {
      groupID: String,
      groupIDs: String,
      groupType: {
        type: Schema.Types.ObjectId,
        ref: 'GroupType',
      },
      installType: String,
      options: String,
      sqft: Number,
      style: String,
      trim: String,
    },
  },
  {
    collection: 'jobsheet-win-grps',
    timestamps: true,
  }
)

jobsheetWindowGroupSchema.virtual('specs.groupTypeID').get(function uFunc() {
  if (this.specs.groupType !== undefined && this.specs.groupType !== null) {
    return this.specs.groupType._id
  }
  return false
})

jobsheetWindowGroupSchema.method('calcSizes', function uFunc() {
  this.items.forEach((inputItem) => {
    let fracW = 0
    let fracH = 0
    let rd
    const item = inputItem

    if (item.dims.height.fraction && item.dims.height.fraction.length) {
      const frac = item.dims.height.fraction
      fracH = parseInt(frac[0], 10) / parseInt(frac[2], 10)
    }
    item.dims.height.decimal = parseFloat(parseInt(item.dims.height.inch, 10) + fracH)
    rd = Math.ceil(item.dims.height.decimal)
    if (rd % 2 !== 0) {
      rd += 1
    }
    item.dims.height.round = rd

    if (item.dims.width.fraction && item.dims.width.fraction.length) {
      const frac = item.dims.width.fraction
      fracW = parseInt(frac[0], 10) / parseInt(frac[2], 10)
    }
    item.dims.width.decimal = parseFloat(parseInt(item.dims.width.inch, 10) + fracW)
    rd = Math.ceil(item.dims.width.decimal)
    if (rd % 2 !== 0) {
      rd += 1
    }
    item.dims.width.round = rd

    const sqft = item.dims.width.round * item.dims.height.round / 144
    item.specs.sqft = Math.ceil(sqft)
  })

  // Now opening dims
  let fracW = 0
  let fracH = 0
  if (this.dims.height.fraction && this.dims.height.fraction.length) {
    const frac = this.dims.height.fraction
    fracH = parseInt(frac[0], 10) / parseInt(frac[2], 10)
  }
  this.dims.height.decimal = parseFloat(parseInt(this.dims.height.inch, 10) + fracH)

  if (this.dims.width.fraction && this.dims.width.fraction.length) {
    const frac = this.dims.width.fraction
    fracW = parseInt(frac[0], 10) / parseInt(frac[2], 10)
  }
  this.dims.width.decimal = parseFloat(parseInt(this.dims.width.inch, 10) + fracW)
})

const JobsheetWindowGroup = mongoose.model('JobsheetWindowGroup', jobsheetWindowGroupSchema)

module.exports = JobsheetWindowGroup
