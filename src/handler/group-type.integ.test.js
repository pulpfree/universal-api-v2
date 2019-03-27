import Handler from './handler'
import config from '../config/config'
import db from '../mongo/connect'

// to test just this file, run: yarn test:w src/handler/group-type.integ.test.js

beforeAll(async () => {
  const cfg = await config.load()
  await db.connect(cfg)
})

test('getGroupTypes', async () => {
  const req = {
    field: 'getGroupTypes',
    arguments: null,
  }
  const res = await Handler(req)
  expect(res.length).toBeGreaterThan(1)
})
