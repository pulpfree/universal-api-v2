/* eslint no-underscore-dangle: 0 */

import JobSheetOther from '../model/jobsheet-other'
import Quote from '../model/quote'

function JobSheetOtherHandler() { }

JobSheetOtherHandler.prototype.find = async (args) => {
  const { jobSheetID } = args
  const q = { jobsheetID: jobSheetID }
  let items

  try {
    items = JobSheetOther.find(q)
  } catch (e) {
    throw new Error(e)
  }
  return items
}

JobSheetOtherHandler.prototype.findOne = async (args) => {
  const { otherID } = args

  let group
  try {
    group = await JobSheetOther.findById(otherID)
  } catch (e) {
    throw new Error(e)
  }
  return group
}

JobSheetOtherHandler.prototype.persist = async (args) => {
  const { input: other } = args
  let otherReturn
  try {
    if (other && other._id) {
      otherReturn = await JobSheetOther.findOneAndUpdate({ _id: other._id }, other, { new: true })
    } else {
      otherReturn = await JobSheetOther.create(other)
    }
  } catch (e) {
    throw new Error(e)
  }
  return otherReturn
}

JobSheetOtherHandler.prototype.remove = async (args) => {
  const { id } = args
  let otherReturn

  // start by checking if window in existing quote
  const q = { 'items.other': id }
  let quoteReturn
  try {
    quoteReturn = await Quote.find(q).count()
  } catch (e) {
    throw new Error(e)
  }
  if (quoteReturn > 0) {
    throw new Error(`There are ${quoteReturn} quotes using this item.`)
  }

  try {
    otherReturn = JobSheetOther.deleteOne({ _id: id })
  } catch (e) {
    throw new Error(e)
  }
  return otherReturn
}

module.exports = JobSheetOtherHandler
