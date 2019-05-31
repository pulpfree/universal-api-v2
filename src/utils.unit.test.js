import * as utils from './utils'

// to test just this file, run: yarn test:w src/handler/customer.integ.test.js
// to test just this file once, run: yarn test src/utils.unit.test.js

test('extract phone just numbers', () => {
  const phone = '9057341164'
  const res = utils.phoneRegex(phone)

  expect(res).toEqual('/\\(905\\) 734-1164/')
})

test('extract phone formatted', () => {
  const phone = '(905) 734-1164'
  const res = utils.phoneRegex(phone)

  expect(res).toEqual('/\\(905\\) 734-1164/')
})
