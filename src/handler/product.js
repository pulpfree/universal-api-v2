const Product = require('../model/product')

function ProductHandler() { }

ProductHandler.prototype.find = async () => {
  const q = {}

  let items
  try {
    items = await Product.find(q).sort({ name: 1 })
  } catch (e) {
    throw new Error(e)
  }
  return items
}

module.exports = ProductHandler
