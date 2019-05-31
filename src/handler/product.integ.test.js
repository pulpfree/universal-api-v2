import Handler from './handler'
import config from '../config/config'
import db from '../mongo/connect'

// to test just this file, run: yarn test:w src/handler/product.integ.test.js

beforeAll(async () => {
  const cfg = await config.load()
  await db.connect(cfg)
})

test('getProducts', async () => {
  const req = {
    field: 'products',
  }
  const res = await Handler(req)

  const { sizeCost } = res[0]
  expect(res.length).toBeGreaterThan(5)
  expect(sizeCost['2']).toEqual(340)
})
