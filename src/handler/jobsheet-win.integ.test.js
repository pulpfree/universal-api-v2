/* eslint no-underscore-dangle: 0 */
import mongoose from 'mongoose'

import Handler from './handler'
import config from '../config/config'
import db from '../mongo/connect'

// to run just this dir, use: yarn jest --watch src/handler
// to test just this file, run: yarn test:w src/handler/jobsheet-win.integ.test.js
// occasionally we may want to clear the jest cache: yarn jest --clearCache
// eslint 'src/handler/jobsheet-win.integ.test.js' --fix

const windowID = '5b18474a2aac045b127ebfeb'
const windowDelID = '5ced4088312ca500078a292c'
const jobSheetID = '5b1846d52aac0450227ebfe9'

const windowUpdate = {
  _id: mongoose.Types.ObjectId('5c70069e91bb9f5da282106e'),
  costs: {
    discounted: 0,
    extendTotal: 1270,
    extendUnit: 1270,
    install: 350,
    installType: 200,
    netUnit: 1270,
    options: 120,
    trim: 75,
    window: 525,
  },
  dims: {
    height: {
      decimal: 60,
      fraction: '',
      inch: 60,
      overSize: null,
      round: 60,
      underSize: null,
    },
    width: {
      decimal: 35,
      fraction: '',
      inch: 35,
      overSize: null,
      round: 36,
      underSize: null,
    },
  },
  productID: mongoose.Types.ObjectId('57855061982d822a04b760a1'),
  qty: 1,
  rooms: ['BR'],
  specs: {
    installType: 'Special Install Type',
    options: 'Pebble: Low E & Argon Gas\nColonial Bars\n',
    extendSqft: 7,
    overSize: 3,
    sqft: 15,
    trim: 'B.M. & Interior \'J\'\nJamb Ext. No Trim\n',
  },
}

const windowNew = {
  costs: {
    discounted: 0,
    extendTotal: 1270,
    extendUnit: 1270,
    install: 350,
    installType: 200,
    netUnit: 1270,
    options: 120,
    trim: 75,
    window: 525,
  },
  dims: {
    height: {
      decimal: 60,
      fraction: '',
      inch: 60,
      overSize: null,
      round: 60,
      underSize: null,
    },
    width: {
      decimal: 35,
      fraction: '',
      inch: 35,
      overSize: null,
      round: 36,
      underSize: null,
    },
  },
  productID: mongoose.Types.ObjectId('57855061982d822a04b760a1'),
  jobsheetID: mongoose.Types.ObjectId('5b1846d52aac0450227ebfe9'),
  qty: 1,
  rooms: ['BR'],
  specs: {
    installType: null,
    options: 'Pebble: Low E & Argon Gas\nColonial Bars\n',
    extendSqft: 7,
    overSize: 3,
    sqft: 15,
    trim: 'B.M. & Interior \'J\'\nJamb Ext. No Trim\n',
  },
}

let newID

beforeAll(async () => {
  const cfg = await config.load()
  await db.connect(cfg)
})

test('jobSheetWindow', async () => {
  const req = {
    field: 'jobSheetWindow',
    arguments: { windowID },
  }
  const res = await Handler(req)

  expect(res.rooms.length).toEqual(1)
  expect(res.costs.window).toEqual(525)
  expect(res.jobsheetID.toString()).toEqual(jobSheetID)
})

test('jobSheetPersistWindow new', async () => {
  const req = {
    field: 'jobSheetPersistWindow',
    arguments: { input: windowNew },
  }
  const res = await Handler(req)
  newID = res._id

  expect(res).toBeTruthy()
})

test('jobSheetPersistWindow update', async () => {
  const req = {
    field: 'jobSheetPersistWindow',
    arguments: { input: windowUpdate },
  }
  const res = await Handler(req)

  expect(res).toBeTruthy()
})

test('jobSheetRemoveWindow', async () => {
  const req = {
    field: 'jobSheetRemoveWindow',
    arguments: { id: newID },
  }

  const res = await Handler(req)
  expect(res).toBeTruthy()
  expect(res.n).toEqual(1)
  expect(res.ok).toEqual(1)
})

test.only('jobSheetRemoveWindow error', async () => {
  const req = {
    field: 'jobSheetRemoveWindow',
    arguments: { id: windowDelID },
  }

  const res = await Handler(req)
  expect(res).toBeTruthy()
  // expect(res.n).toEqual(1)
  // expect(res.ok).toEqual(1)
})
