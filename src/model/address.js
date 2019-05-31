const mongoose = require('mongoose')

const { Schema } = mongoose

const addressSchema = new Schema(
  {
    associate: {
      required: true,
      index: true,
      type: String,
      validate: {
        validator: v => /^(customer|user|jobsheet)$/i.test(v),
      },
    },
    associateID: {
      type: Schema.Types.ObjectId,
    },
    city: {
      maxlength: 55,
      minlength: 3,
      required: true,
      trim: true,
      type: String,
    },
    country: {
      maxlength: 55,
      minlength: 3,
      trim: true,
      type: String,
    },
    countryCode: {
      maxlength: 2,
      minlength: 2,
      type: String,
    },
    customerID: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
    location: {
      type: {
        type: String,
      },
      coordinates: {
        type: Array,
      },
    },
    postalCode: {
      required: true,
      trim: true,
      type: String,
    },
    province: {
      trim: true,
      type: String,
    },
    provinceCode: {
      required: true,
      maxlength: 2,
      minlength: 2,
      type: String,
    },
    street1: {
      required: true,
      index: true,
      trim: true,
      type: String,
    },
    street2: {
      trim: true,
      type: String,
    },
    type: {
      required: true,
      type: String,
      validate: {
        validator: v => /^(com|res)$/.test(v),
      },
    },
  },
  {
    timestamps: true,
  }
)

const Address = mongoose.model('Address', addressSchema)

module.exports = Address
