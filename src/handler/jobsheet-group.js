/* eslint no-underscore-dangle: 0 */
import JobSheetGroup from '../model/jobsheet-win-grp'
import Quote from '../model/quote'

function JobSheetGroupHandler() { }

JobSheetGroupHandler.prototype.find = (args) => {
  const { jobSheetID } = args
  const q = { jobsheetID: jobSheetID }

  let items
  try {
    items = JobSheetGroup
      .find(q)
      .populate('specs.groupType')
  } catch (e) {
    throw new Error(e)
  }
  return items
}

JobSheetGroupHandler.prototype.findOne = async (args) => {
  const { groupID } = args

  let group
  try {
    group = await JobSheetGroup.findById(groupID).populate('specs.groupType')
  } catch (e) {
    throw new Error(e)
  }
  return group
}

JobSheetGroupHandler.prototype.persist = async (args) => {
  const { input: group } = args
  let groupReturn
  try {
    if (group && group._id) {
      groupReturn = await JobSheetGroup.findOneAndUpdate({ _id: group._id }, group, { new: true })
    } else {
      groupReturn = await JobSheetGroup.create(group)
    }
  } catch (e) {
    throw new Error(e)
  }
  return groupReturn
}

JobSheetGroupHandler.prototype.remove = async (args) => {
  const { id } = args
  let groupReturn

  // start by checking if window in existing quote
  const q = { 'items.group': id }
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
    groupReturn = JobSheetGroup.deleteOne({ _id: id })
  } catch (e) {
    throw new Error(e)
  }
  return groupReturn
}

module.exports = JobSheetGroupHandler
