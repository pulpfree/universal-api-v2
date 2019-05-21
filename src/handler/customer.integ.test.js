/* eslint no-underscore-dangle: 0 */
// import mongoose from 'mongoose'

import Handler from './handler'
import config from '../config/config'
import db from '../mongo/connect'

import {
  addressNew,
  addressUpdate,
  customerNew,
  customerUpdate,
} from '../test/mockData'

// to run just this dir, use: yarn jest src/handler/customer.integ.test.js
// to test just this file, run: yarn test:w src/handler/customer.integ.test.js
// occasionally we may want to clear the jest cache: yarn jest --clearCache

let newID
const customerID = '5b2122022aac043b0c7ec06d'

beforeAll(async () => {
  const cfg = await config.load()
  await db.connect(cfg)
})

test('get Customer', async () => {
  const req = {
    field: 'customer',
    arguments: { customerID: '5b1846c62aac040faf7ebfe7' },
  }
  const res = await Handler(req)
  expect(res.name.first).toEqual('Joe')
})

test('get Customer return error', async () => {
  const req = {
    field: 'customer',
    arguments: { customerID: '' },
  }

  let msg = false
  try {
    await Handler(req)
  } catch (e) {
    msg = e.message
  }
  expect(msg).toBeTruthy()
})

test('searchCustomerName', async () => {
  const req = {
    field: 'searchCustomer',
    arguments: {
      field: 'name.last',
      value: 'Di',
    },
  }
  const res = await Handler(req)
  expect(res.length).toBeGreaterThan(1)
})

test('searchCustomerNameInActive', async () => {
  const req = {
    field: 'searchCustomer',
    arguments: {
      field: 'name.last',
      value: 'Di',
      active: false,
    },
  }
  const res = await Handler(req)
  let allFalse = true
  res.forEach((r) => {
    if (r.active === true) allFalse = false
  })
  expect(allFalse).toEqual(true)
})

test.only('searchPhones', async () => {
  const req = {
    field: 'searchCustomer',
    arguments: {
      field: 'phones.number',
      // value: '(905)',
      // value: '(905) 735',
      value: '(905) 735-1340',
    },
  }
  const res = await Handler(req)
  // console.log('res:', res)
  expect(res).toBeTruthy()
  expect(res.length).toEqual(1)
})

test('searchAddress', async () => {
  const search = 'Si'
  const req = {
    field: 'searchCustomer',
    arguments: {
      search,
    },
  }
  const res = await Handler(req)
  const regex = RegExp(`^[0-9]*\\s.?${search}`, 'i')
  let allTrue = true
  res.forEach((r) => {
    if (!regex.test(r.address.street1)) allTrue = false
  })
  expect(allTrue).toEqual(true)
})

test('persist new Customer', async () => {
  const req = {
    field: 'customerPersist',
    arguments: { customerInput: customerNew, addressInput: addressNew },
  }
  const res = await Handler(req)
  newID = res._id

  expect(res).toBeTruthy()
})

test('persist update Customer', async () => {
  const req = {
    field: 'customerPersist',
    arguments: { customerInput: customerUpdate, addressInput: addressUpdate },
  }
  const res = await Handler(req)
  expect(res).toBeTruthy()
})

test('persist update Customer, no address', async () => {
  const req = {
    field: 'customerPersist',
    arguments: { customerInput: customerUpdate },
  }
  const res = await Handler(req)
  expect(res).toBeTruthy()
})

test('persist update Customer, address only', async () => {
  const req = {
    field: 'customerPersist',
    arguments: { addressInput: addressUpdate },
  }
  await expect(Handler(req)).rejects.toThrow()
})

test('customer Remove', async () => {
  const req = {
    field: 'customerRemove',
    arguments: { id: newID },
  }

  const res = await Handler(req)
  expect(res).toBeTruthy()
  expect(res.n).toEqual(1)
  expect(res.ok).toEqual(1)
})

test('customer Remove fail', async () => {
  const req = {
    field: 'customerRemove',
    arguments: { id: customerID },
  }
  await expect(Handler(req)).rejects.toThrow(/There/)
})

test('customer toggle active', async () => {
  const cReq = {
    field: 'customer',
    arguments: { customerID },
  }
  const cRes = await Handler(cReq)

  const req = {
    field: 'customerToggleActive',
    arguments: { id: customerID },
  }
  const res = await Handler(req)
  expect(res).toBeTruthy()
  expect(res.active).toEqual(!cRes.active)
})

test('persist notes', async () => {
  const notes = 'New test notes for customer.\nNew line here.'
  const req = {
    field: 'customerPersistNotes',
    arguments: {
      id: customerID,
      notes,
    },
  }
  const res = await Handler(req)
  expect(res).toBeTruthy()
})
