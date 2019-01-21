import Customer from './customer'

const handlerMap = {
  getCustomer: {
    model: Customer,
    method: 'findOne',
  },
  searchCustomer: {
    model: Customer,
    method: 'search',
  },
  searchCustomerByAddress: {
    model: Customer,
    method: 'searchAddress',
  },
}

async function Handler(req) {
  const { method, model: MapClass } = handlerMap[req.field]
  const c = new MapClass()

  let res
  try {
    res = c[method](req.arguments)
  } catch (e) {
    return e
  }
  return res
}

module.exports = Handler
