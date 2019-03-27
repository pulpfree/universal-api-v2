/* eslint no-underscore-dangle: 0 */
import mongoose from 'mongoose'
import moment from 'moment'
import ramda from 'ramda'
import fetch from 'node-fetch'

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
  try {
    for (const quote of quotes) {
      quote.jobsheetID.addressID = await fetchAddress(quote.jobsheetID.addressID)
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

QuoteHandler.prototype.remove = async (args) => {
  const { id } = args

  let quoteReturn
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

/**
 * Helper functions
 */


/* QuoteHandler.prototype.create = (req, reply) => {
  let props = Object.keys(Quote.schema.paths),
    record = {},
    items

  if (req.payload.items) {
    let is = sanz(req.payload.items)
    items = {
      'items.group': is.group || null,
      'items.other': is.other || null,
      'items.window': is.window || null,
    }
    delete req.payload.items
  }
  const payload = Utils.JSONflatten(req.payload)
  Object.assign(payload, items)

  props.map(key => {
    if (payload[key] !== undefined) {
      record[key] = sanz(payload[key])
    }
  })

  const quoteNum = QuoteMeta.fetchNextQuoteNum().exec(),
    quote = new Quote(record),
    error = quote.validateSync()
  if (error) return reply(Boom.badRequest(error))

  let jobsheet = setSheet(record.jobsheetID)
  jobsheet(true).then(sheet => {
    setSheetSummary(sheet, quote)

    quoteNum.then(num => {
      quote.number = num.value
      quote.save(err => {
        if (err) return reply(Boom.badRequest(err))
        reply(quote).code(201)
      })
    })
  })
} */

/* QuoteHandler.prototype.pdf = (req, reply) => {
  // const isDev     = process.env.NODE_ENV === 'development' || false
  const quoteID = sanz(req.payload.quoteID)
  const docType = sanz(req.payload.docType)
  const sendMail = sanz(req.payload.sendMail) || false
  if (!quoteID) {
    return reply(Boom.badRequest('Missing quoteID in QuoteHandler.prototype.pdf'))
  }
  if (!docType) {
    return reply(Boom.badRequest('Missing docType in QuoteHandler.prototype.pdf'))
  }

  const payload = {
    quoteID,
    docType,
    sendMail,
  }
  let lambdaURI = constants.AWS.createPDFAPI
  // if (isDev) {
  //   lambdaURI = 'http://127.0.0.1:3000/create-pdf'
  // } else {
  //   lambdaURI = constants.AWS.createPDFAPI
  // }

  request(
    {
      method: 'POST',
      uri: lambdaURI,
      body: JSON.stringify(payload),
    },
    (error, response) => {
      if (response.statusCode == 201) {
        reply(payload).code(201)
      } else {
        reply(Boom.badRequest(error.message))
      }
    }
  )
} */

/* QuoteHandler.prototype.patch = (req, reply) => {
  const id = sanz(req.params.id)
  const field = sanz(req.payload.field)
  const value = sanz(req.payload.value)

  let props = Object.keys(Quote.schema.paths)
  if (props.indexOf(field) < 0) {
    return reply(Boom.badRequest('Invalid field requested'))
  }
  const q = {
    [field]: value,
  }

  Quote.findByIdAndUpdate(id, q, (err, model) => {
    if (err) return reply(Boom.badRequest(err))
    reply(model).code(200)
  })
} */

module.exports = QuoteHandler

/* function setSheet(jobsheetID) {

  let sheet
  const q = { jobsheetID }

  return co.wrap(function* () {
    try {
      sheet = yield {
        jobsheet: Jobsheet.findById(jobsheetID).populate('addressID'),
        window: JobsheetWindow.find(q).populate('productID').sort({ updatedAt: 1 }),
        group: JobsheetWindowGroup.find(q).populate('specs.groupType').sort({ updatedAt: 1 }),
        other: JobsheetOther.find(q).sort({ updatedAt: 1 }),
      }
    } catch (err) {
      return err
    }

    // Now fetch products for group items and populate
    let productIDs = []
    sheet.group.forEach(grp => {
      grp.items.forEach(item => {
        productIDs.push(item.productID)
      })
    })
    let products = yield Product.find({ _id: { $in: productIDs } })

    sheet.group.forEach(grp => {
      if (grp.specs.groupTypeID) {
        grp.specs.groupID = grp.specs.groupTypeID
      }
      grp.items.forEach(item => {
        item.productID = products.find(p => {
          return p._id.toString() === item.productID.toString()
        })
      })
    })
    return sheet
  })
} */

/* function setSheetSummary(sheet, quote) {

  const types = ['window', 'group', 'other']
  let items = {},
    totals = {},
    summary = {},
    tmpCosts = {
      extendTotal: 0,
    }

  types.forEach(t => {
    items[t] = []

    // Reset costs
    totals[t] = Object.assign({}, tmpCosts)

    if (quote.items[t] !== undefined && quote.items[t].length > 0) {
      let sheetTypeItems = sheet[t]

      quote.items[t].forEach(i => {
        let sheetItem = sheetTypeItems.find(ele => {
          return ele._id.toString() === i.toString()
        })
        let itemInfo = extractItemInfo(sheetItem, t)
        items[t].push(itemInfo)
      })

      // Calculate totals
      items[t].forEach(it => {
        totals[t].extendTotal += it.costs.extendTotal || 0
      })
    }
    summary[t] = {
      items: items[t],
      totals: totals[t],
    }
  })

  quote.itemSummary = summary
  quote.itemCosts.group = summary.group.totals.extendTotal
  quote.itemCosts.other = summary.other.totals.extendTotal
  quote.itemCosts.window = summary.window.totals.extendTotal
  quote.itemCosts.subtotal = quote.itemCosts.group + quote.itemCosts.other + quote.itemCosts.window

  const taxMultiplier = parseFloat(constants.HST / 100)
  const taxDivisor = parseFloat(1 + taxMultiplier)

  if (quote.discount.total) {
    const subtotal = quote.discount.total / taxDivisor
    const discount = {
      description: quote.discount.description,
      discount: quote.itemCosts.subtotal - quote.discount.total,
      subtotal,
      tax: quote.discount.total - subtotal,
      total: quote.discount.total,
    }
    quote.discount = discount
    quote.quotePrice.subtotal = discount.subtotal
    quote.quotePrice.tax = discount.tax
    quote.quotePrice.total = discount.total
  } else {
    const subtotal = quote.itemCosts.subtotal / taxDivisor
    quote.quotePrice.subtotal = subtotal
    quote.quotePrice.tax = quote.itemCosts.subtotal - subtotal
    quote.quotePrice.total = quote.itemCosts.subtotal
  }
} */

/* function extractItemInfo(item, type) {
  let info = {}
  switch (type) {
    case 'window':
      info.specs = {
        installType: item.specs.installType,
        name: item.productID.name,
        options: item.specs.options,
        productID: item.productID._id,
      }
      info.qty = item.qty
      info.costs = {
        discountAmount: item.costs.discountAmount,
        discounted: item.costs.discounted,
        extendTotal: item.costs.extendTotal,
        extendUnit: item.costs.extendUnit,
        netUnit: item.costs.discounted > 0 ? item.costs.discounted : item.costs.extendUnit,
      }
      info.rooms = item.rooms.join(', ')
      return info

    case 'group':
      info.specs = {
        groupTypeID: item.specs.groupType._id.toString(),
        installType: item.specs.installType,
        name: item.specs.groupType.name,
        options: item.specs.options,
      }
      info.qty = item.qty
      info.costs = {
        discountAmount: item.costs.discountAmount,
        discounted: item.costs.discounted,
        extendTotal: item.costs.extendTotal,
        extendUnit: item.costs.extendUnit,
        netUnit: item.costs.discounted > 0 ? item.costs.discounted : item.costs.extendUnit,
      }
      info.rooms = item.rooms.join(', ')
      return info

    case 'other':
      info.description = item.description
      info.qty = item.qty
      info.specs = item.specs
      info.costs = item.costs
      info.rooms = item.rooms.join(', ')
      return info
  }
} */


/* async function processArray(array) {
  // map array to promises
  const promises = array.map(delayedLog)
  // wait until all promises are resolved
  await Promise.all(promises)
  console.log('Done!')
} */
