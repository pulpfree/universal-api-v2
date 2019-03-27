import Customer from './customer'
import JobSheet from './jobsheet'
import JobSheetWindow from './jobsheet-win'
import JobSheetOther from './jobsheet-other'
import JobSheetGroup from './jobsheet-group'
import GroupTypes from './group-type'
import Address from './address'
import Product from './product'
import Quote from './quote'

const handlerMap = {
  address: {
    model: Address,
    method: 'findOne',
  },
  addressByAssociate: {
    model: Address,
    method: 'find',
  },
  addressPersist: {
    model: Address,
    method: 'persist',
  },
  addressRemove: {
    model: Address,
    method: 'remove',
  },
  customer: {
    model: Customer,
    method: 'findOne',
  },
  customerPersist: {
    model: Customer,
    method: 'persist',
  },
  customerRemove: {
    model: Customer,
    method: 'remove',
  },
  searchCustomer: {
    model: Customer,
    method: 'search',
  },
  searchJobSheetsByCustomer: {
    model: JobSheet,
    method: 'find',
  },
  jobSheetData: {
    model: JobSheet,
    method: 'findOne',
  },
  jobSheetPersist: {
    model: JobSheet,
    method: 'persist',
  },
  jobSheetRemove: {
    model: JobSheet,
    method: 'remove',
  },
  jobSheetGroup: {
    model: JobSheetGroup,
    method: 'findOne',
  },
  jobSheetPersistGroup: {
    model: JobSheetGroup,
    method: 'persist',
  },
  jobSheetRemoveGroup: {
    model: JobSheetGroup,
    method: 'remove',
  },
  jobSheetOther: {
    model: JobSheetOther,
    method: 'findOne',
  },
  jobSheetPersistOther: {
    model: JobSheetOther,
    method: 'persist',
  },
  jobSheetRemoveOther: {
    model: JobSheetOther,
    method: 'remove',
  },
  jobSheetWindow: {
    model: JobSheetWindow,
    method: 'findOne',
  },
  jobSheetPersistWindow: {
    model: JobSheetWindow,
    method: 'persist',
  },
  jobSheetRemoveWindow: {
    model: JobSheetWindow,
    method: 'remove',
  },
  groupTypes: {
    model: GroupTypes,
    method: 'find',
  },
  pdfSignedURL: {
    model: Quote,
    method: 'pdfSignedURL',
  },
  products: {
    model: Product,
    method: 'find',
  },
  quote: {
    model: Quote,
    method: 'findOne',
  },
  searchQuotes: {
    model: Quote,
    method: 'find',
  },
  quotePersist: {
    model: Quote,
    method: 'persist',
  },
  quoteRemove: {
    model: Quote,
    method: 'remove',
  },
}

/* const thundra = require('@thundra/core')(
  { apiKey: 'b41775a3-4be7-4bbc-8106-ef649370ad63' }
)

exports.handler = thundra((req) => {
  callback(null, "Hello Thundra!"});
}); */

async function Handler(req, cfg) {
  const { method, model: MapClass } = handlerMap[req.field]
  const c = new MapClass()

  let res
  try {
    res = c[method](req.arguments, cfg)
  } catch (e) {
    return e
  }
  return res
}

module.exports = Handler
