/* eslint-disable no-undef, no-underscore-dangle */

/**
 * Script to create jobsheet number field
 */

const uri = 'localhost:27017'
const conn = new Mongo(uri)
const db = conn.getDB('universal-sales')

const cursor = db.jobsheets.find().sort({ updatedAt: 1 })

let jsNum = 1000

printjson(cursor.count())

while (cursor.hasNext()) {
  const doc = cursor.next()
  // printjson(doc.updatedAt)
  const res = db.jobsheets.updateOne({ _id: doc._id }, { $set: { number: jsNum } })

  printjson(res)
  jsNum += 1
}
