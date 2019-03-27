/* eslint no-underscore-dangle: 0 */
import moment from 'moment'
import mongoose from 'mongoose'

import Handler from './handler'
import config from '../config/config'
import db from '../mongo/connect'

// to test just this file, run: yarn test:w src/handler/quote.integ.test.js

const quoteID = '5b19e0c62aac0409e37ec013'
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

test.only('quotePersist', async () => {
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
