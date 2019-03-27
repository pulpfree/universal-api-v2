const mongoose = require('mongoose')

const { Schema } = mongoose

const quoteMetaSchema = new Schema(
  {
    name: {
      required: true,
      type: String,
      unique: true,
    },
    value: {
      type: Number,
      required: true,
    },
  },
  {
    collection: 'quote-meta',
    timestamps: true,
  }
)

quoteMetaSchema.static('fetchNextQuoteNum', function unFunc(callback) {
  return this.findOneAndUpdate(
    { name: 'quoteNumber' },
    { $inc: { value: 1 } },
    { new: true, fields: { value: true, _id: false } },
    callback
  )
})

const QuoteMeta = mongoose.model('QuoteMeta', quoteMetaSchema)

module.exports = QuoteMeta
