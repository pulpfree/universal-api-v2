/* eslint no-underscore-dangle: 0 */
import mongoose from 'mongoose'

import Handler from './handler'
import config from '../config/config'
import db from '../mongo/connect'


// to run just this dir, use: yarn jest --watch src/handler
// to test just this file, run: yarn test:w src/handler/jobsheet-group.integ.test.js
// occasionally we may want to clear the jest cache: yarn jest --clearCache

const groupID = '5b195db0c2e75ffe21fdd0ed'
const groupDelID = '5ce99fdd025e19724c914f0b'

const groupNew = {
  jobsheetID: mongoose.Types.ObjectId('5b1846d52aac0450227ebfe9'),
  costs: {
    extendTotal: 1700.0,
    extendUnit: 1700.0,
    install: 500.0,
    installType: 200.0,
    netUnit: 1700.0,
    options: 0.0,
    trim: 0.0,
    window: null,
  },
  dims: {
    height: {
      decimal: 57.625,
      diff: 0.0,
      fraction: '5/8',
      inch: 57,
    },
    width: {
      decimal: 64.875,
      diff: 0.125,
      fraction: '7/8',
      inch: 64,
    },
  },
  items: [
    {
      _id: mongoose.Types.ObjectId('5c6ea585d30c27218f9c706a'),
      costs: {
        extendUnit: 500.0,
        extendTotal: 1000.0,
      },
      dims: {
        height: {
          decimal: 57.625,
          fraction: '5/8',
          inch: 57,
          overSize: null,
          round: 58,
          underSize: null,
        },
        width: {
          decimal: 32.375,
          fraction: '3/8',
          inch: 32,
          overSize: null,
          round: 34,
          underSize: null,
        },
      },
      product: {
        name: '2 Casements (L & R)',
      },
      productID: mongoose.Types.ObjectId('57855061982d822a04b760a8'),
      qty: 1,
      specs: {
        extendSqft: 28,
        options: null,
        overSize: 2,
        sqft: 14,
      },
    },
  ],
  qty: 1,
  rooms: [],
  specs: {
    groupID: '5799108994787d9d9173ab54',
    groupType: mongoose.Types.ObjectId('5799108994787d9d9173ab54'),
    installType: 'Semi Frame',
    options: 'White: Low E & Argon Gas (dark)',
    sqft: 27,
    style: null,
    trim: 'Aluminum Capping',
  },
}

const groupUpdate = {
  _id: mongoose.Types.ObjectId('5c77ff88598d3c5c13c64c28'),
  jobsheetID: mongoose.Types.ObjectId('5b1846d52aac0450227ebfe9'),
  costs: {
    extendTotal: 1700.0,
    extendUnit: 1700.0,
    install: 500.0,
    installType: 200.0,
    netUnit: 1700.0,
    options: 0.0,
    trim: 0.0,
    window: null,
  },
  dims: {
    height: {
      decimal: 57.625,
      diff: 0.0,
      fraction: '5/8',
      inch: 57,
    },
    width: {
      decimal: 64.875,
      diff: 0.125,
      fraction: '7/8',
      inch: 64,
    },
  },
  items: [
    {
      costs: {
        extendUnit: 500.0,
        extendTotal: 1000.0,
      },
      dims: {
        height: {
          decimal: 57.625,
          fraction: '5/8',
          inch: 57,
          overSize: null,
          round: 58,
          underSize: null,
        },
        width: {
          decimal: 32.375,
          fraction: '3/8',
          inch: 32,
          overSize: null,
          round: 34,
          underSize: null,
        },
      },
      product: {
        name: '2 Casements (L & R)',
      },
      productID: mongoose.Types.ObjectId('57855061982d822a04b760a8'),
      specs: {
        extendSqft: 28,
        options: null,
        overSize: 2,
        sqft: 14,
      },
    },
  ],
  qty: 1,
  rooms: [],
  specs: {
    groupID: '5799108994787d9d9173ab54',
    groupType: mongoose.Types.ObjectId('5799108994787d9d9173ab54'),
    installType: 'Semi Frame',
    options: 'White: Low E & Argon Gas (dark)',
    sqft: 27,
    style: null,
    trim: 'Aluminum Capping\n',
  },
}

let newID

beforeAll(async () => {
  const cfg = await config.load()
  await db.connect(cfg)
})

test('jobSheetGroup', async () => {
  const req = {
    field: 'jobSheetGroup',
    arguments: { groupID },
  }
  const res = await Handler(req)

  expect(res).toBeTruthy()
})

test('jobSheetPersistGroup new', async () => {
  const req = {
    field: 'jobSheetPersistGroup',
    arguments: { input: groupNew },
  }
  const res = await Handler(req)
  newID = res._id

  expect(res).toBeTruthy()
})

test('jobSheetPersistGroup update', async () => {
  const req = {
    field: 'jobSheetPersistGroup',
    arguments: { input: groupUpdate },
  }
  const res = await Handler(req)

  expect(res).toBeTruthy()
})

test('jobSheetRemoveGroup', async () => {
  const req = {
    field: 'jobSheetRemoveGroup',
    arguments: { id: newID },
  }

  const res = await Handler(req)
  expect(res).toBeTruthy()
  expect(res.n).toEqual(1)
  expect(res.ok).toEqual(1)
})

test.only('jobSheetRemoveGroup fail', async () => {
  const req = {
    field: 'jobSheetRemoveGroup',
    arguments: { id: groupDelID },
  }

  const res = await Handler(req)
  expect(res).toThrow()
})
