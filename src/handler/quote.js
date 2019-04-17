/* eslint no-underscore-dangle: 0 */
import mongoose from 'mongoose'
import moment from 'moment'
import ramda from 'ramda'
import fetch from 'node-fetch'
import AWS from 'aws-sdk'

const Address = require('../model/address')
const Quote = require('../model/quote')
const QuoteMeta = require('../model/quote-meta')

const latestLimit = 100

const defaults = {
  discount: {
    description: '',
    discount: 0.00,
    tax: 0.00,
    subtotal: 0.00,
    total: 0.00,
  },
  itemCosts: {
    group: 0.00,
    other: 0.00,
    window: 0.00,
  },
  quotePrice: {
    subtotal: 0.00,
    tax: 0.00,
    total: 0.00,
  },
}

async function fetchAddress(addressID) {
  let address
  try {
    address = Address.findById(addressID)
  } catch (e) {
    throw new Error(e)
  }
  return address
}

async function savePDF(args, cfg) {
  const url = cfg.PDFSaveURI
  try {
    await fetch(url, {
      method: 'post',
      body: JSON.stringify(args),
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    throw new Error(e)
  }
}

// todo: nice if there was a way to authenticate without using accessKeyId and screenAccessKey
async function deletePDFs(args, cfg) {
  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    accessKeyId: cfg.awsAccessKeyId,
    secretAccessKey: cfg.awsSecretAccessKey,
  })
  const params = {
    Bucket: cfg.s3Bucket,
    Prefix: args.docType,
  }
  // fetch objects and assemble array of objects to delete
  let S3Objects
  try {
    S3Objects = await s3.listObjectsV2(params).promise()
  } catch (e) {
    throw new Error(e)
  }
  const retObjects = S3Objects.Contents.filter(o => o.Key.indexOf(args.number) > -1)
  if (!retObjects.length) return false
  const delObjects = retObjects.map(o => ({ Key: o.Key }))

  // now delete
  const delParams = {
    Bucket: cfg.s3Bucket,
    Delete: {
      Objects: delObjects,
    },
  }
  let delRet
  try {
    delRet = await s3.deleteObjects(delParams).promise()
  } catch (e) {
    throw new Error(e)
  }
  return delRet
}

function QuoteHandler() { }

QuoteHandler.prototype.find = async (args) => {
  const q = {}
  let qts

  // query for searchQuotesByCustomer field
  if (args && args.customerID) {
    const customerID = mongoose.Types.ObjectId(args.customerID)
    q.customerID = customerID
    qts = Quote.find(q).sort({ updatedAt: -1 })
  }

  if (ramda.hasPath(['invoiced'], args)) {
    q.invoiced = args.invoiced
    if (ramda.hasPath(['closed'], args)) {
      q.closed = args.closed
    }
  }

  if (ramda.hasPath(['year'], args) && args.year) {
    const sDte = moment().year(args.year).startOf('year').utc()
    const eDte = sDte.clone().endOf('year').utc()
    q.createdAt = { $gte: sDte, $lte: eDte }

    qts = Quote.find(q)
      .populate('customerID')
      .populate('jobsheetID')
      .sort({ updatedAt: -1 })
  } else { // searching latest
    qts = Quote.find(q)
      .populate('customerID')
      .populate('jobsheetID')
      .sort({ updatedAt: -1 })
      .limit(latestLimit)
  }

  let quotes
  try {
    quotes = await qts
  } catch (e) {
    throw new Error(e)
  }

  // We could look into using the mongoose cursor and transform methods here
  // see: https://mongoosejs.com/docs/api.html#query_Query-cursor
  // fixme: using for/of and await in loop not good practice
  try {
    for (const quote of quotes) { // eslint-disable-line
      quote.jobsheetID.addressID = await fetchAddress(quote.jobsheetID.addressID) // eslint-disable-line
    }
  } catch (e) {
    throw new Error(e)
  }
  // Now create totals
  let totalInvoiced = 0.00
  let totalOutstanding = 0.00
  if (ramda.hasPath(['invoiced']) && args.invoiced) {
    totalInvoiced = quotes.reduce((accum, val) => accum + val.quotePrice.total, 0.00)
    totalOutstanding = quotes.reduce((accum, val) => accum + val.quotePrice.outstanding, 0.00)
  }

  return {
    quotes,
    totalInvoiced,
    totalOutstanding,
  }
}

QuoteHandler.prototype.findOne = async (args) => {
  const { quoteID } = args

  let quote
  try {
    quote = await Quote.findById(quoteID)
      .populate('customerID')
      .populate('jobsheetID')
    quote.jobsheetID.addressID = await fetchAddress(quote.jobsheetID.addressID)
  } catch (e) {
    throw new Error(e)
  }
  return quote
}

QuoteHandler.prototype.persist = async (args, cfg) => {
  const { input: quote } = args
  const isNew = !quote._id

  if (isNew) {
    let quoteNum
    try {
      quoteNum = await QuoteMeta.fetchNextQuoteNum()
    } catch (e) {
      throw new Error(e)
    }
    quote.number = quoteNum.value
  }

  let quoteReturn
  try {
    if (isNew) {
      const quoteWithDefaults = Object.assign({}, quote, defaults)
      quoteReturn = await Quote.create(quoteWithDefaults)
    } else {
      quoteReturn = await Quote.findOneAndUpdate(
        { _id: quote._id },
        quote,
        { new: true }
      )
    }
  } catch (e) {
    throw new Error(e)
  }

  // Save PDF
  const pdfArgs = {
    quoteID: quoteReturn._id,
    docType: 'quote',
  }
  if (!isNew) {
    await savePDF(pdfArgs, cfg)
  }
  console.info('Successfully saved quote: ', quoteReturn) // eslint-disable-line
  return quoteReturn
}

QuoteHandler.prototype.remove = async (args, cfg) => {
  const { id } = args

  let quote
  let quoteReturn
  try {
    quote = await Quote.findById(id, { number: 1, invoiced: 1, 'quotePrice.payments': 1 })
  } catch (e) {
    throw new Error(e)
  }
  if (!quote) return false

  if (quote.quotePrice.payments > 0) {
    throw new Error('Cannot delete an invoice with payments')
  }

  if (quote.invoiced) {
    deletePDFs({ docType: 'invoice', number: quote.number }, cfg)
    await Quote.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(id) },
      { invoiced: false },
      { new: true }
    )
    return {
      n: 1,
      ok: 1,
    }
  }

  await deletePDFs({ docType: 'quote', number: quote.number }, cfg)

  try {
    quoteReturn = await Quote.deleteOne({ _id: id })
  } catch (e) {
    throw new Error(e)
  }
  return quoteReturn
}

QuoteHandler.prototype.pdfSignedURL = async (args, cfg) => {
  const payload = Object.assign({}, args.input)
  const url = cfg.PDFCreateURLURI

  // see: https://www.valentinog.com/blog/http-requests-node-js-async-await/
  // and: https://www.npmjs.com/package/node-fetch#post-with-json <- liking this so far
  let response
  try {
    response = await fetch(url, {
      method: 'post',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    throw new Error(e)
  }
  return response.json()
}

QuoteHandler.prototype.createInvoice = async (args, cfg) => {
  const { id } = args

  let quote
  try {
    quote = await Quote.findById(id)
  } catch (e) {
    throw new Error(e)
  }

  // Save PDF
  const pdfArgs = {
    quoteID: id,
    docType: 'invoice',
  }
  await savePDF(pdfArgs, cfg)
  return Quote.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId(id) },
    { invoiced: true, 'quotePrice.outstanding': quote.quotePrice.total },
    { new: true }
  )
}

QuoteHandler.prototype.persistDiscount = async (args) => {
  const { input } = args
  const { _id, discount, quotePrice } = input

  let quoteReturn
  try {
    quoteReturn = await Quote.findOneAndUpdate(
      { _id },
      { discount, quotePrice },
      { new: true }
    )
  } catch (e) {
    throw new Error(e)
  }
  return quoteReturn
}

module.exports = QuoteHandler
