/* eslint-disable no-undef, no-underscore-dangle */

/**
 * Script updates the jobsheet-win-grps table to record the existing name of group type into
 * new field: groupTypeDescription
 */

const uri = 'localhost:27017'
const conn = new Mongo(uri)
const db = conn.getDB('universal-sales')

const cursor = db['jobsheet-win-grps'].find()

while (cursor.hasNext()) {
  const doc = cursor.next()
  const gtID = doc.specs.groupType

  const gt = db['group-types'].findOne({ _id: gtID })
  const gtName = gt.name

  const res = db['jobsheet-win-grps'].updateOne({ _id: doc._id }, { $set: { 'specs.groupTypeDescription': gtName } })
  printjson(res)
}
