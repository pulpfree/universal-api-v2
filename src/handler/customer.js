/* eslint no-underscore-dangle: 0 */
import mongoose from 'mongoose'
import sanz from 'mongo-sanitize'
import ramda from 'ramda'

import Address from '../model/address'
import Customer from '../model/customer'

const CUSTOMER_LIMIT = 100

function CustomerHandler() { }

CustomerHandler.prototype.findOne = async (args) => {
  let cust
  try {
    cust = await Customer.findById(args.id)
  } catch (e) {
    throw new Error(e)
  }

  // Now their customer associated address
  try {
    cust.address = await Address.findOne({ customerID: cust._id, associate: 'customer' })
  } catch (e) {
    throw new Error(e)
  }

  return cust
}

CustomerHandler.prototype.search = async (args) => {
  const { field } = args
  const str = sanz(args.value)
  const regex = new RegExp(`^${str}`, 'i')
  const active = args.active !== undefined ? args.active : true

  const pipeline = [
    {
      $match: {
        active,
        [field]: regex,
      },
    },
    {
      $lookup: {
        from: 'addresses',
        let: {
          customerID: '$_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$$customerID', '$customerID'],
                  },
                  {
                    $eq: ['$associate', 'customer'],
                  },
                ],
              },
            },
          },
        ],
        as: 'address',
      },
    },
    { $unwind: '$address' },
    { $sort: { 'name.last': 1 } },
    { $limit: CUSTOMER_LIMIT },
  ]

  let res
  try {
    res = await Customer.aggregate(pipeline)
  } catch (e) {
    throw new Error(e)
  }

  return res
}

/*
  Search by jobsheet associated address
*/
CustomerHandler.prototype.searchAddress = async (args) => {
  if (!args.search) {
    throw new Error('Missing search criteria')
  }

  const q = {}
  const search = sanz(args.search)
  q.street1 = new RegExp(`${search}`, 'i')
  q.associate = 'jobsheet'

  let addrs
  try {
    addrs = await Address.find(q)
  } catch (e) {
    throw new Error(e)
  }

  const ids = addrs.map(a => a.customerID)
  const custIDs = ramda.uniq(ids).map(c => mongoose.Types.ObjectId(c))

  const customers = await Customer.find({ _id: { $in: custIDs } }).sort({ 'name.last': 1 })
  customers.forEach((c) => {
    c.address = ramda.find(ramda.propEq('customerID', c._id))(addrs) // eslint-disable-line no-param-reassign
  })

  return customers
}

module.exports = CustomerHandler
