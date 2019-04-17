/* eslint no-underscore-dangle: 0 */
import Handler from './handler'
import config from '../config/config'
import db from '../mongo/connect'

// to test just this file, run: yarn test:w src/handler/payment.integ.test.js

let cfg
let newID
const quoteID = '5b19e0c62aac0409e37ec013' // closed quote with payments etc

beforeAll(async () => {
  process.env.Stage = 'test'
  cfg = await config.load()
  await db.connect(cfg)
})

test('getPayments', async () => {
  const req = {
    field: 'payments',
    arguments: { quoteID },
  }
  const res = await Handler(req)

  expect(res).toBeTruthy()
  expect(res.length).toBeGreaterThan(0)
  expect(res[0].quoteID.toString()).toEqual(quoteID)
})

test('paymentPersist new', async () => {
  const paymentInput = {
    amount: 500,
    quoteID,
    type: 'cheque',
  }
  const req = {
    field: 'paymentPersist',
    arguments: {
      input: paymentInput,
    },
  }
  const res = await Handler(req)
  newID = res._id

  expect(res).toBeTruthy()
})

test('paymentPersist update', async () => {
  const paymentInput = {
    _id: newID,
    amount: 600,
    quoteID,
    type: 'cheque',
  }
  const req = {
    field: 'paymentPersist',
    arguments: {
      input: paymentInput,
    },
  }
  const res = await Handler(req)
  newID = res._id

  expect(res).toBeTruthy()
})

test('paymentRemove', async () => {
  const req = {
    field: 'paymentRemove',
    arguments: { id: newID },
  }
  const res = await Handler(req)

  expect(res).toBeTruthy()
  expect(res.n).toEqual(1)
})
