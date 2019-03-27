const mongoose = require('mongoose')

const { Schema } = mongoose

const groupTypeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    collection: 'group-types',
    timestamps: true,
  }

)

const GroupType = mongoose.model('GroupType', groupTypeSchema)

module.exports = GroupType
