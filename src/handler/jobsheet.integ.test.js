/* eslint no-underscore-dangle: 0 */
import mongoose from 'mongoose'

import Handler from './handler'
import config from '../config/config'
import db from '../mongo/connect'

import { addressNew } from '../test/mockData'

// to run just this dir, use: yarn test:w src/handler/jobsheet.integ.test.js
// occasionally we may want to clear the jest cache: yarn jest --clearCache

const addressID = '5b1846d52aac04948a7ebfe8'
const customerID = '5b2122022aac043b0c7ec06d'
const jobSheetID = '5b1846d52aac0450227ebfe9'
const jobSheetNew = {
  customerID: mongoose.Types.ObjectId(customerID),
  addressID: mongoose.Types.ObjectId(addressID),
}
const delFailJobSheetID = '5b2122152aac04d9f57ec06f'
const delJobSheetID = '5ce69196ec2d8e7c1cb03dec'

let newID

beforeAll(async () => {
  const cfg = await config.load()
  await db.connect(cfg)
})

test('searchJobSheetsByCustomer', async () => {
  const req = {
    field: 'searchJobSheetsByCustomer',
    arguments: { customerID },
  }
  const res = await Handler(req)

  expect(res.length).toBeGreaterThan(1)
})

test('getJobSheetData', async () => {
  const req = {
    field: 'jobSheetData',
    arguments: { jobSheetID },
  }
  const res = await Handler(req)

  expect(res.windows.length).toBeGreaterThan(1)
  expect(res.groups.length).toBeGreaterThan(1)
  expect(res.other.length).toEqual(1)
})

test('jobSheetPersist new with Address', async () => {
  delete jobSheetNew.addressID
  const req = {
    field: 'jobSheetPersist',
    arguments: { jobSheetInput: jobSheetNew, addressInput: addressNew },
  }
  const res = await Handler(req)
  newID = res._id
  // console.log('newID:', newID)
  expect(res).toBeTruthy()
})

test('jobSheetRemove newID', async () => {
  const req = {
    field: 'jobSheetRemove',
    arguments: { id: newID },
  }
  const res = await Handler(req)
  expect(res).toBeTruthy()
  expect(res.n).toEqual(1)
  expect(res.ok).toEqual(1)
})

test('jobSheetRemove existing', async () => {
  const id = mongoose.Types.ObjectId(delFailJobSheetID)
  const req = {
    field: 'jobSheetRemove',
    arguments: { id },
  }
  await expect(Handler(req)).rejects.toThrow(/There/)
})

test.only('jobSheetRemove ok', async () => {
  const id = mongoose.Types.ObjectId(delJobSheetID)
  const req = {
    field: 'jobSheetRemove',
    arguments: { id },
  }
  const res = await Handler(req)
  expect(res).toBeTruthy()
  expect(res.n).toEqual(1)
  expect(res.ok).toEqual(1)
})

test('jobSheet persist Features', async () => {
  const features = 'AC Vinyl Windows (Darker)\nLow E & Argon Gas\nFull-frame Change 2 3/4" Fingerjoint Trim\nAluminum Capping\nComplete Garbage Removal\nInstalled Including HST'
  const req = {
    field: 'jobSheetPersistFeatures',
    arguments: { id: jobSheetID, features },
  }
  const res = await Handler(req)
  expect(res).toBeTruthy()
  expect(res.features).toEqual(features)
})
