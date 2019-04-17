/* eslint no-underscore-dangle: 0 */
// import mongoose from 'mongoose'

const Payment = require('../model/payment')
const Quote = require('../model/quote')

async function updateQuotePayment(quoteID) {
  if (!quoteID) {
    throw new Error('missing quote ID')
  }
  // start with fetch quote
  let quote
  try {
    quote = await Quote.findById(quoteID)
  } catch (e) {
    throw new Error(e)
  }

  // next fetch all payments and summarize
  let payments
  try {
    payments = await Payment.find({ quoteID })
  } catch (e) {
    throw new Error(e)
  }

  if (payments.length <= 0) return false
  const payTotal = payments.reduce((accum, curVal) => accum + curVal.amount, 0.00)

  const quotePrice = Object.assign({}, quote.quotePrice)
  quotePrice.outstanding = parseFloat(quotePrice.total - payTotal)
  quotePrice.payments = payTotal

  try {
    quote = await Quote.findOneAndUpdate(
      { _id: quoteID },
      { quotePrice },
      { new: true }
    )
  } catch (e) {
    throw new Error(e)
  }
  return quote
}

function PaymentHandler() { }

PaymentHandler.prototype.find = async (args) => {
  const { quoteID } = args
  let payments

  try {
    payments = await Payment.find({ quoteID }).sort({ updatedAt: -1 })
  } catch (e) {
    throw new Error(e)
  }
  return payments
}

PaymentHandler.prototype.persist = async (args) => {
  const { input } = args
  let paymentReturn

  try {
    if (input._id) {
      paymentReturn = await Payment.findOneAndUpdate(
        { _id: input._id },
        input,
        { new: true },
      )
    } else {
      paymentReturn = await Payment.create(input)
    }
  } catch (e) {
    throw new Error(e)
  }
  await updateQuotePayment(paymentReturn.quoteID)
  return paymentReturn
}

PaymentHandler.prototype.remove = async (args) => {
  const { id } = args
  let paymentReturn

  // fetch payment
  const payment = await Payment.findById(id)

  // remove payment
  try {
    paymentReturn = await Payment.deleteOne({ _id: id })
  } catch (e) {
    throw new Error(e)
  }
  await updateQuotePayment(payment.quoteID)
  return paymentReturn
}

module.exports = PaymentHandler
