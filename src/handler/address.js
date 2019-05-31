/* eslint no-underscore-dangle: 0 */
import mongoose from 'mongoose'
import sanz from 'mongo-sanitize'

import Address from '../model/address'

function AddressHandler() { }

AddressHandler.prototype.find = async (args) => {
  const q = {}

  if (!args.associate) {
    throw new Error('Missing associate value in address query')
  }
  q.associate = sanz(args.associate)
  if (args.associateID) {
    q.customerID = mongoose.Types.ObjectId(sanz(args.associateID))
  }

  let items
  try {
    items = Address.find(q)
  } catch (e) {
    throw new Error(e)
  }
  return items
}

AddressHandler.prototype.findOne = async (args) => {
  const q = {}

  if (!args.associate) {
    throw new Error('Missing associate value in address query')
  }
  q.associate = sanz(args.associate)
  if (!args.associateID) {
    throw new Error('Missing associate id value in address query')
  }
  q.customerID = mongoose.Types.ObjectId(sanz(args.associateID))

  let address
  try {
    address = Address.findOne(q)
  } catch (e) {
    throw new Error(e)
  }
  return address
}

AddressHandler.prototype.persist = async (args) => {
  const { input: address } = args
  let addressReturn
  try {
    if (address && address._id) {
      addressReturn = await Address.findOneAndUpdate({ _id: address._id }, address, { new: true })
    } else {
      addressReturn = await Address.create(address)
    }
  } catch (e) {
    throw new Error(e)
  }
  return addressReturn
}

AddressHandler.prototype.remove = async (args) => {
  const { id } = args
  let addressReturn
  try {
    addressReturn = Address.deleteOne({ _id: id })
  } catch (e) {
    throw new Error(e)
  }
  return addressReturn
}

/* AddressHandler.prototype.create = (req, reply) => {
  let props = Object.keys(Address.schema.paths)
  let record = {}
  props.map(key => {
    if (req.payload[key] !== undefined) {
      record[key] = sanz(req.payload[key])
    }
  })

  const address = new Address(record)
  const error = address.validateSync()
  if (error) return reply(Boom.badRequest(error))

  address.save(err => {
    if (err) return reply(Boom.badRequest(err))
    reply(address).code(201)
  })
} */

/* AddressHandler.prototype.update = (req, reply) => {
  const id = sanz(req.params.id)
  let props = Object.keys(Address.schema.paths)
  let record = {}
  props.map(key => {
    if (req.payload[key] !== undefined) {
      record[key] = sanz(req.payload[key])
    }
  })

  Address.findOneAndUpdate({ _id: id }, record, { new: true }).exec((err, doc) => {
    if (err) { return reply(Boom.badRequest(err)) }
    reply(doc).code(200)
  })
} */

/* AddressHandler.prototype.remove = (req, reply) => {
  const id = sanz(req.params.id)
  Address.findByIdAndRemove(id, err => {
    if (err) reply(Boom.badRequest(err))
    reply({ responseOk: true }).code(200)
  })
} */


module.exports = AddressHandler
