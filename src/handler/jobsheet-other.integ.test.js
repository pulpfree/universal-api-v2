/* eslint no-underscore-dangle: 0 */
import mongoose from 'mongoose'

import Handler from './handler'
import config from '../config/config'
import db from '../mongo/connect'

// to run just this dir, use: yarn jest --watch src/handler
// to test just this file, run: yarn test:w src/handler/jobsheet-other.integ.test.js
// occasionally we may want to clear the jest cache: yarn jest --clearCache
// const jobSheetID = '5b2122152aac04d9f57ec06f'
const otherID = '5c4dc803ea79e1fdf69c152c'
const otherDelID = '5ce9a0ec025e199639914f11'

const otherNew = {
  jobsheetID: mongoose.Types.ObjectId('5b2122152aac04d9f57ec06f'),
  costs: {
    extendTotal: 7000.0,
    extendUnit: 3500.0,
  },
  description: 'Half Round Over New Window',
  qty: 2,
  rooms: [],
  specs: {
    options: 'White Low E and Argon Gas',
    location: 'Living Room and Dining Room',
  },
}

const otherUpdate = {
  _id: mongoose.Types.ObjectId('5c7941817fee5db739e23e67'),
  jobsheetID: mongoose.Types.ObjectId('5b2122152aac04d9f57ec06f'),
  costs: {
    extendTotal: 7000.0,
    extendUnit: 3500.0,
  },
  description: 'UPDATE Half Round Over Double Casement Single Fixed',
  qty: 2,
  rooms: ['BS', 'FR'],
  specs: {
    options: 'White Low E and Argon Gas',
    location: 'Living Room and Dining Room',
  },
}

let newID

beforeAll(async () => {
  const cfg = await config.load()
  await db.connect(cfg)
})

test('getJobSheetOther', async () => {
  const req = {
    field: 'jobSheetOther',
    arguments: { otherID },
  }
  const res = await Handler(req)
  expect(res).toBeTruthy()
})

test('jobSheetPersistOther new', async () => {
  const req = {
    field: 'jobSheetPersistOther',
    arguments: { input: otherNew },
  }
  const res = await Handler(req)
  newID = res._id

  expect(res).toBeTruthy()
})

test('jobSheetPersistOther update', async () => {
  const req = {
    field: 'jobSheetPersistOther',
    arguments: { input: otherUpdate },
  }
  const res = await Handler(req)
  // newID = res._id

  expect(res).toBeTruthy()
})

test('jobSheetRemoveOther', async () => {
  const req = {
    field: 'jobSheetRemoveOther',
    arguments: { id: newID },
  }

  const res = await Handler(req)
  expect(res).toBeTruthy()
  expect(res.n).toEqual(1)
  expect(res.ok).toEqual(1)
})

test.only('jobSheetRemoveOther fail', async () => {
  const req = {
    field: 'jobSheetRemoveOther',
    arguments: { id: otherDelID },
  }

  const res = await Handler(req)
  expect(res).toThrow()
})
