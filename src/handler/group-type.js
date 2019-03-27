const GroupType = require('../model/group-type')

function GroupTypeHandler() { }

GroupTypeHandler.prototype.find = () => {
  const q = {}
  let items
  try {
    items = GroupType.find(q).sort({ sort: 1 })
  } catch (e) {
    throw new Error(e)
  }
  return items
}

module.exports = GroupTypeHandler
