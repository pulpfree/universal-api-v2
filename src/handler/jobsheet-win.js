/* eslint no-underscore-dangle: 0 */
import JobSheetWindow from '../model/jobsheet-win'

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
  // console.log('window:', window)

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
  try {
    winReturn = JobSheetWindow.deleteOne({ _id: id })
  } catch (e) {
    throw new Error(e)
  }
  return winReturn
}

module.exports = JobSheetWindowHandler
