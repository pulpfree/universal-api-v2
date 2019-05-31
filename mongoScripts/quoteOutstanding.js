/* eslint-disable no-undef, no-underscore-dangle */

/**
 * Script to fix outstanding value issue
 */

const uri = 'localhost:27017'
const conn = new Mongo(uri)
const db = conn.getDB('universal-sales')

const cursor = db.quotes.find({
  invoiced: true,
  closed: false,
  'quotePrice.outstanding': null,
  'quotePrice.payments': null,
})


printjson(cursor.count())

while (cursor.hasNext()) {
  const doc = cursor.next()
  // printjson(doc.quotePrice)
  const res = db.quotes.updateOne({ _id: doc._id }, { $set: { 'quotePrice.outstanding': doc.quotePrice.total, 'quotePrice.payments': 0 } })

  printjson(res)
}
