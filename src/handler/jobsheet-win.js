/* eslint no-underscore-dangle: 0 */
import JobSheetWindow from '../model/jobsheet-win'
import Quote from '../model/quote'

function JobSheetWindowHandler() { }

JobSheetWindowHandler.prototype.findOne = async (args) => {
  const { windowID } = args

  let window
  try {
    window = await JobSheetWindow.findById(windowID).populate('productID')
  } catch (e) {
    throw new Error(e)
  }
  return window
}

JobSheetWindowHandler.prototype.persist = async (args) => {
  const { input: window } = args

  let winReturn
  try {
    if (window && window._id) {
      winReturn = await JobSheetWindow.findOneAndUpdate({ _id: window._id }, window, { new: true })
    } else {
      winReturn = await JobSheetWindow.create(window)
    }
  } catch (e) {
    throw new Error(e)
  }
  return winReturn
}

JobSheetWindowHandler.prototype.remove = async (args) => {
  const { id } = args
  let winReturn

  // start by checking if window in existing quote
  const q = { 'items.window': id }
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
    winReturn = JobSheetWindow.deleteOne({ _id: id })
  } catch (e) {
    throw new Error(e)
  }
  return winReturn
}

module.exports = JobSheetWindowHandler
