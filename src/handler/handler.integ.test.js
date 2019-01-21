import Handler from './handler'
import config from '../config/config'
import db from '../mongo/connect'


// to run just this dir, use: yarn jest --watch src/handler
// occasionally we may want to clear the jest cache: yarn jest --clearCache

beforeAll(async () => {
  const cfg = await config.load()
  await db.connect(cfg)
})

test('getCustomer', async () => {
  const req = {
    field: 'getCustomer',
    arguments: { id: '5b1846c62aac040faf7ebfe7' },
  }
  const res = await Handler(req)
  expect(res.name.first).toEqual('Joe')
})


test('getCustomer return error', async () => {
  const req = {
    field: 'getCustomer',
    arguments: { id: '' },
  }

  let msg = false
  try {
    await Handler(req)
  } catch (e) {
    msg = e.message
  }
  expect(msg).toBeTruthy()
})

test('searchCustomer', async () => {
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

test('searchAddress', async () => {
  const req = {
    field: 'searchCustomerByAddress',
    arguments: {
      search: 'a',
    },
  }
  const res = await Handler(req)
  expect(res.length).toBeGreaterThan(1)
})
