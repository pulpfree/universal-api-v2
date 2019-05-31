/* eslint no-underscore-dangle: 0 */
import moment from 'moment'
import mongoose from 'mongoose'

import Handler from './handler'
import config from '../config/config'
import db from '../mongo/connect'

// to test just this file, run: yarn test:w src/handler/quote.integ.test.js

const quoteID = '5b19e0c62aac0409e37ec013' // closed quote with payments etc
const quoteIDInv = '5ccdfc868719aa50eb71837b' // invoiced quote÷å
const quoteIDdel = '5ccdfc868719aa50eb71837b' // quote to delete
const quoteIDCreateInvoice = '5c6f1e44d30c2756139c706b'
const customerID = '5b1846c62aac040faf7ebfe7'

const quoteNew = {
  customerID: mongoose.Types.ObjectId('5b1846c62aac040faf7ebfe7'),
  jobsheetID: mongoose.Types.ObjectId('5b1846d52aac0450227ebfe9'),
}

let newID
let cfg

beforeAll(async () => {
  process.env.Stage = 'test'
  cfg = await config.load()
  await db.connect(cfg)
})

test('getQuote', async () => {
  const req = {
    field: 'quote',
    arguments: { quoteID },
  }
  const res = await Handler(req)

  expect(res).toBeTruthy()
  expect(res.customerID.name.first).toBeTruthy()
})

test('searchQuotesByCustomerID', async () => {
  const req = {
    field: 'searchQuotes',
    arguments: { customerID },
  }
  const res = await Handler(req)
  expect(res.quotes.length).toBeGreaterThan(2)
})

test('searchQuotesByRecent', async () => {
  const req = {
    field: 'searchQuotes',
    arguments: {
      year: '',
      invoiced: true,
      closed: true,
    },
  }
  const res = await Handler(req)
  const firstItem = res.quotes[0]

  expect(res.quotes.length).toBeGreaterThanOrEqual(1)
  expect(firstItem.jobsheetID.addressID).toBeDefined()

  let allInvoiced = true
  let allClosed = true
  res.quotes.forEach((r) => {
    if (r.invoiced !== true) {
      allInvoiced = false
    }
    if (r.closed !== true) {
      allClosed = false
    }
  })
  expect(allClosed).toBeTruthy()
  expect(allInvoiced).toBeTruthy()
})

test('searchQuotesByYear', async () => {
  const req = {
    field: 'searchQuotes',
    arguments: {
      year: '2019',
      invoiced: true,
      closed: false,
    },
  }
  const res = await Handler(req)
  expect(res.quotes.length).toBeGreaterThan(2)

  let allYears = true
  let allInvoiced = true
  res.quotes.forEach((r) => {
    const createdAt = moment(r.createdAt)
    const year = createdAt.year()
    if (year !== 2019) {
      allYears = false
    }
    if (r.invoiced !== true) {
      allInvoiced = false
    }
  })
  expect(allYears).toBeTruthy()
  expect(allInvoiced).toBeTruthy()
})

test('quotePersist', async () => {
  const req = {
    field: 'quotePersist',
    arguments: {
      input: quoteNew,
    },
  }
  const res = await Handler(req, cfg)
  newID = res._id

  expect(res).toBeTruthy()
})

test('quoteRemove newID', async () => {
  const req = {
    field: 'quoteRemove',
    arguments: { id: newID },
  }
  const res = await Handler(req)
  expect(res).toBeTruthy()
  expect(res.n).toEqual(1)
  expect(res.ok).toEqual(1)
})

// this doesn't work, likely due to the Handle is not directly throwing the error
/* test('invoiceRemove', () => {
  const req = {
    field: 'quoteRemove',
    arguments: { id: quoteID },
  }
  expect(() => { Handler(req) }).toThrowError(/Cannot delete/)
}) */

/* test('quoteRemove invoice', async () => {
  const req = {
    field: 'quoteRemove',
    arguments: { id: quoteIDInv },
  }
  const res = await Handler(req, cfg)

  // console.log('res:', res)
  // expect(res).toBeTruthy()
  // expect(res.invoiced).toEqual(false)
  // expect(res.ok).toEqual(1)
}) */

test('quoteRemove basic', async () => {
  const req = {
    field: 'quoteRemove',
    arguments: { id: quoteIDdel },
  }
  const res = await Handler(req, cfg)

  // console.log('res:', res)
  expect(res).toBeTruthy()
  // expect(res.invoiced).toEqual(false)
  // expect(res.ok).toEqual(1)
})


test('pdfCreateURL', async () => {
  const req = {
    field: 'pdfSignedURL',
    arguments: {
      input: {
        number: 1083,
        type: 'quote',
        version: 1,
      },
    },
  }
  const res = await Handler(req, cfg)
  expect(res).toBeTruthy()
  expect(res.data.url).toEqual(expect.stringMatching(/^https:\/\/ca-universalwindows.s3.ca-central-1.amazonaws.com\/quote\/qte-1083-r1.pdf/))
})

test('createInvoice', async () => {
  const req = {
    field: 'createInvoice',
    arguments: { id: quoteIDCreateInvoice },
  }
  const res = await Handler(req, cfg)
  expect(res).toBeTruthy()
  expect(res.invoiced).toEqual(true)
})

test('persist discount', async () => {
  // base itemCosts.subtotal is 3700
  const input = {
    _id: quoteIDInv,
    discount: {
      description: 'Adjust for something',
      discount: 200,
      subtotal: 3097.345132743,
      tax: 402.654867257,
      total: 3500,
    },
    quotePrice: {
      outstanding: 0,
      payments: 0,
      subtotal: 3097.345132743,
      tax: 402.654867257,
      total: 3500,
    },
  }
  const req = {
    field: 'quotePersistDiscount',
    arguments: { input },
  }
  const res = await Handler(req, cfg)
  expect(res).toBeTruthy()
})

test.only('nearbyJobs', async () => {
  const req = {
    field: 'quoteNearbyJobs',
    arguments: {
      input: {
        // coordinates: [-79.2576469, 43.0095132],
        coordinates: [-79.2730617, 43.01442460000001],
        // maxDistance: 1200,
      },
    },
  }
  const res = await Handler(req, cfg)
  expect(res).toBeTruthy()
  expect(res.length).toBeGreaterThan(5)
})
