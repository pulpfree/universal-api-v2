/* eslint no-underscore-dangle: 0 */
import mongoose from 'mongoose'
import sanz from 'mongo-sanitize'
// import ramda from 'ramda'

const Address = require('../model/address')
const JobSheet = require('../model/jobsheet')
const JobSheetOther = require('../model/jobsheet-other')
const JobSheetWindow = require('../model/jobsheet-win')
const JobSheetWindowGroup = require('../model/jobsheet-win-grp')
const Product = require('../model/product')
const Quote = require('../model/quote')

function JobSheetHandler() { }

JobSheetHandler.prototype.find = async (args) => {
  const q = {}
  const customerID = mongoose.Types.ObjectId(sanz(args.customerID))
  if (!customerID) {
    throw new Error('Missing customer id in jobsheet query')
  }
  q.customerID = customerID

  let items
  try {
    items = await JobSheet.find(q)
      .populate('addressID')
      .sort({ updatedAt: -1 })
  } catch (e) {
    throw new Error(e)
  }
  return items
}

JobSheetHandler.prototype.findOne = async (args) => {
  const { jobSheetID } = args
  let sheet
  const q = { jobsheetID: jobSheetID }

  try {
    sheet = {
      jobsheet: await JobSheet.findById(jobSheetID).populate('addressID').populate('customerID'),
      windows: await JobSheetWindow.find(q).populate('productID').sort({ createdAt: 1 }),
      groups: await JobSheetWindowGroup.find(q).populate('specs.groupType').sort({ createdAt: 1 }),
      other: await JobSheetOther.find(q).sort({ createdAt: 1 }),
    }
  } catch (e) {
    throw new Error(e)
  }

  // Now fetch products for group items and populate
  const productIDs = []
  sheet.groups.forEach((grp) => {
    grp.items.forEach((item) => {
      productIDs.push(item.productID)
    })
  })
  const products = await Product.find({ _id: { $in: productIDs } })

  sheet.groups.forEach((grp) => {
    const tmpGrp = grp
    if (tmpGrp.specs.groupTypeID) {
      tmpGrp.specs.groupID = tmpGrp.specs.groupTypeID
    }
    tmpGrp.items.forEach((item) => {
      const tmpItem = item
      tmpItem.product = products.find(p => (
        p._id.toString() === tmpItem.productID.toString()
      ))
    })
  })

  return sheet
}

JobSheetHandler.prototype.persist = async (args) => {
  const { jobSheetInput: jobSheet, addressInput, addressID } = args
  let jobSheetReturn
  let addressReturn

  // We're either given an address object for a new address location
  // or addressID for existing address, typically where customers current residence
  if (!addressInput && !addressID) {
    throw new Error('Missing address or addressID for jobsheet')
  }

  // if address object submitted, then we're creating a new address for this jobsheet
  if (addressInput) {
    try {
      addressReturn = await Address.create(addressInput)
    } catch (e) {
      throw new Error(e)
    }
  }
  // Should be safe at this point to assign addressID
  jobSheet.addressID = addressReturn._id

  // Now create jobSheet
  try {
    jobSheetReturn = JobSheet.create(jobSheet)
  } catch (e) {
    throw new Error(e)
  }
  return jobSheetReturn
}

JobSheetHandler.prototype.remove = async (args) => {
  const { id } = args
  const jobsheetID = mongoose.Types.ObjectId(id)
  let jsReturn

  // Test if any quotes associated with jobsheet
  let nQuotes = null
  const quoteQuery = {
    jobsheetID: id,
  }
  try {
    nQuotes = await Quote.countDocuments(quoteQuery)
  } catch (e) {
    throw new Error(e)
  }
  if (nQuotes) {
    throw new Error(`There are ${nQuotes} Quotes associated with this Job Sheet`)
  }

  // Fetch jobsheet so we can address
  let jobSh
  try {
    jobSh = JobSheet.findById(id)
  } catch (e) {
    throw new Error(e)
  }
  try {
    await Address.deleteOne({ _id: jobSh.addressID })
  } catch (e) {
    throw new Error(e)
  }

  // Start with the windows
  try {
    await JobSheetWindow.deleteMany({ jobsheetID })
  } catch (e) {
    throw new Error(e)
  }

  // Then groups
  try {
    await JobSheetWindowGroup.deleteMany({ jobsheetID })
  } catch (e) {
    throw new Error(e)
  }

  // Now other items windows
  try {
    await JobSheetOther.deleteMany({ jobsheetID })
  } catch (e) {
    throw new Error(e)
  }

  // Finally the actual jobsheet
  try {
    jsReturn = await JobSheet.deleteOne({ _id: id })
  } catch (e) {
    throw new Error(e)
  }
  return jsReturn
}


/* JobsheetHandler.prototype.remove = (req, reply) => {
  const id = sanz(req.params.id)
  const addressID = sanz(req.payload.addressID)

  // First remove all types
  const jsID = mongoose.Types.ObjectId(id)
  const jsQ = { jobsheetID: jsID }
  const aQ = { _id: mongoose.Types.ObjectId(addressID) }

  // First check for any associated quotes
  const qts = Quote.find({ jobsheetID: id }).exec()
  qts.then(res => {
    if (res.length > 0) {
      return reply(Boom.badRequest(`Your request cannot be completed as there are ${res.length} quotes associated with this jobsheet.`))
    } else {
      Promise.all([
        Address.remove(aQ).exec(),
        Jobsheet.remove({ _id: jsID }).exec(),
        JobSheetOther.remove(jsQ).exec(),
        JobSheetWindow.remove(jsQ).exec(),
        JobSheetWindowGroup.remove(jsQ).exec(),
      ]).then(() => reply({ responseOk: true, id: id }).code(200))
        .catch(err => reply(Boom.badRequest(err)))
    }
  })
} */

module.exports = JobSheetHandler
