/* eslint no-underscore-dangle: 0 */
// import mongoose from 'mongoose'

import Handler from './handler'
import config from '../config/config'
import db from '../mongo/connect'

// to test just this file, run: yarn test:w src/handler/address.integ.test.js

const customerID = '5b1846c62aac040faf7ebfe7'
const addressID = '5c7989efd6622f528b9c0bc7'

const addressNew = {
  associate: 'customer',
  city: 'Welland',
  country: null,
  countryCode: 'CA',
  postalCode: 'L3C 5Y2',
  provinceCode: 'ON',
  street1: '47 Northgate Dr.',
  street2: null,
  type: 'res',
}

const addressUpdate = {
  _id: addressID,
  associate: 'customer',
  city: 'Welland',
  country: null,
  countryCode: 'CA',
  postalCode: 'L3C 5Y2',
  provinceCode: 'ON',
  street1: '47 Colonial Dr.',
  street2: null,
  type: 'res',
}

let newID

beforeAll(async () => {
  const cfg = await config.load()
  await db.connect(cfg)
})

test('get Address', async () => {
  const req = {
    field: 'address',
    arguments: {
      associate: 'customer',
      associateID: customerID,
    },
  }
  const res = await Handler(req)

  expect(res).toBeTruthy()
  expect(res.associate).toEqual('customer')
})

test('get AddressByAssociate', async () => {
  const req = {
    field: 'addressByAssociate',
    arguments: {
      associate: 'customer',
      associateID: customerID,
    },
  }
  const res = await Handler(req)
  expect(res.length).toEqual(1)
})

test('persist new address', async () => {
  const req = {
    field: 'addressPersist',
    arguments: { input: addressNew },
  }
  const res = await Handler(req)
  newID = res._id

  expect(res).toBeTruthy()
})

test('persist existing address', async () => {
  const req = {
    field: 'addressPersist',
    arguments: { input: addressUpdate },
  }
  const res = await Handler(req)

  expect(res).toBeTruthy()
})

test('addressRemove', async () => {
  const req = {
    field: 'addressRemove',
    arguments: { id: newID },
  }

  const res = await Handler(req)
  expect(res).toBeTruthy()
  expect(res.n).toEqual(1)
  expect(res.ok).toEqual(1)
})
