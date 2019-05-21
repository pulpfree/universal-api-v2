/* eslint no-underscore-dangle: 0 */
import mongoose from 'mongoose'
import sanz from 'mongo-sanitize'
import ramda from 'ramda'

import Address from '../model/address'
import Customer from '../model/customer'
import JobSheet from '../model/jobsheet'
import { phoneRegex } from '../utils'

const CUSTOMER_LIMIT = 100

function CustomerHandler() { }

CustomerHandler.prototype.findOne = async (args) => {
  let cust
  try {
    cust = await Customer.findById(args.customerID)
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

async function searchByField(args) {
  const { field } = args
  const str = sanz(args.value)
  let regex
  if (field === 'phones.number') {
    regex = new RegExp(`${phoneRegex(str)}`)
  } else {
    regex = new RegExp(`^${str}`, 'i')
  }
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

  // return pipeline
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
async function searchByAddress(args) {
  if (!args.search) {
    throw new Error('Missing search criteria')
  }

  const q = {}
  const search = sanz(args.search)
  q.street1 = new RegExp(`^[0-9]+\\s${search}`, 'i')
  q.associate = 'jobsheet'
  let addrs
  try {
    addrs = await Address.find(q)
  } catch (e) {
    throw new Error(e)
  }
  // return {q, addrs}
  const ids = addrs.map(a => a.customerID)
  const custIDs = ramda.uniq(ids).map(c => mongoose.Types.ObjectId(c))

  const customers = await Customer.find({ _id: { $in: custIDs } }).sort({ 'name.last': 1 })
  customers.forEach((c) => {
    c.address = ramda.find(ramda.propEq('customerID', c._id))(addrs) // eslint-disable-line no-param-reassign
  })
  return customers
}

CustomerHandler.prototype.search = async (args) => {
  if (ramda.hasPath(['field'], args) && args.field.length > 0) {
    return searchByField(args)
  }
  if (ramda.hasPath(['search'], args) && args.search.length > 0) {
    return searchByAddress(args)
  }
  return false
}

CustomerHandler.prototype.persist = async (args) => {
  const { customerInput: customer, addressInput: address } = args
  let customerReturn

  try {
    if (customer && customer._id) {
      customerReturn = await Customer.findOneAndUpdate(
        { _id: customer._id },
        customer,
        { new: true },
      )
    } else {
      customerReturn = await Customer.create(customer)
    }
  } catch (e) {
    throw new Error(e)
  }
  if (address) {
    address.customerID = customerReturn._id
    try {
      if (address._id) {
        await Address.findOneAndUpdate({ _id: address._id }, address, { new: true })
      } else {
        await Address.create(address)
      }
    } catch (e) {
      throw new Error(e)
    }
  }
  return customerReturn
}

CustomerHandler.prototype.remove = async (args) => {
  const { id } = args
  const q = {}
  const customerID = mongoose.Types.ObjectId(id)

  // start by checking for existing jobsheets
  let nSheets = null
  q.customerID = customerID
  try {
    nSheets = await JobSheet.countDocuments(q)
  } catch (e) {
    throw new Error(e)
  }
  if (nSheets) {
    throw new Error(`There are ${nSheets} Jobsheet(s) associated with this customer`)
  }

  // if customer has no sheets, start by deleting addresses
  try {
    await Address.deleteMany({ customerID: mongoose.Types.ObjectId(id) })
  } catch (e) {
    throw new Error(e)
  }

  let customerReturn
  try {
    customerReturn = await Customer.deleteOne({ _id: id })
  } catch (e) {
    throw new Error(e)
  }
  return customerReturn
}

CustomerHandler.prototype.toggleActive = async (args) => {
  const { id } = args
  const customerID = mongoose.Types.ObjectId(id)

  let cust
  try {
    cust = await Customer.findById(id, { active: 1 })
  } catch (e) {
    throw new Error(e)
  }

  let customerReturn
  try {
    customerReturn = await Customer.findOneAndUpdate(
      { _id: customerID },
      { active: !cust.active },
      { new: true },
    )
  } catch (e) {
    throw new Error(e)
  }
  return customerReturn
}

CustomerHandler.prototype.persistNotes = async (args) => {
  const { id, notes } = args
  const customerID = mongoose.Types.ObjectId(id)

  let customerReturn
  try {
    customerReturn = await Customer.findOneAndUpdate(
      { _id: customerID },
      { notes },
      { new: true },
    )
  } catch (e) {
    throw new Error(e)
  }
  return customerReturn
}

module.exports = CustomerHandler
