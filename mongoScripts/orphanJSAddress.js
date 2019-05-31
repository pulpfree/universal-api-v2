/* eslint-disable no-undef, no-underscore-dangle */

/**
 * Find and remove orphaned jobsheet addresses
 */

const uri = 'localhost:27017'
const conn = new Mongo(uri)
const db = conn.getDB('universal-sales')

const delRecords = true

const custCursor = db.customers.find()
while (custCursor.hasNext()) {
  const custDoc = custCursor.next()
  const customerID = custDoc._id
  const goodAdrs = []
  const cursor = db.jobsheets.find({ customerID })

  // printjson('jscount: ')
  // printjson(cursor.count())
  while (cursor.hasNext()) {
    const doc = cursor.next()
    goodAdrs.push(doc.addressID)
  }
  // printjson(goodAdrs)

  if (delRecords) {
    const delRes = db.addresses.deleteMany({ customerID, associate: 'jobsheet', _id: { $nin: goodAdrs } })
    if (delRes.deletedCount > 0) {
      printjson(`customerID: ${customerID}`)
      printjson(delRes)
    }
  }

  if (!delRecords) {
    const adrCursor = db.addresses.find({ customerID, associate: 'jobsheet', _id: { $nin: goodAdrs } })
    if (adrCursor.count() > 0) {
      printjson(`customerID: ${customerID}`)
      printjson(adrCursor.count())
    }
  }
}
