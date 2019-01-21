
const mongoose = require('mongoose')

const { Schema } = mongoose

const phoneSchema = new Schema(
  {
    countryCode: {
      type: String,
      trim: true,
      default: '1',
    },
    extension: String,
    number: String,
    _id: String,
  }
)

const customerSchema = new Schema(
  {
    active: {
      type: Boolean,
      required: true,
      index: true,
      default: true,
    },
    address: {},
    email: {
      type: String,
      index: true,
      trim: true,
      unique: true,
      // validate: [validateEmail, 'Please enter valid email address'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
    },
    name: {
      first: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 35,
      },
      last: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 35,
      },
      spouse: {
        type: String,
        minlength: 2,
        maxlength: 35,
      },
      prefix: String,
    },
    phones: [phoneSchema],
  },
  {
    timestamps: true,
  }
)

const Customer = mongoose.model('Customer', customerSchema)

module.exports = Customer
