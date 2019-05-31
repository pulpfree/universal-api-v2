/* eslint-disable import/prefer-default-export */

function fmtPostalCode(code) {
  const postalCode = code
  const validPat = /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ] ?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i
  const valid = validPat.test(postalCode)
  if (!valid) return false

  // add space if missing
  if (postalCode.length === 6) {
    const re = /(.{3})(.{3})/
    return postalCode.replace(re, '$1 $2')
  }

  return postalCode
}

module.exports = fmtPostalCode
