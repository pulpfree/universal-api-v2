/* eslint-disable no-console, import/no-extraneous-dependencies, import/no-dynamic-require, no-underscore-dangle */

// usage: node ./geoCoordinates.js

const NodeGeocoder = require('node-geocoder')
const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
// const mongoose = require('mongoose')

const { MongoClient } = require('mongodb')

const fmtPostalCode = require('./utils')

const url = 'mongodb://192.168.86.24:27017'
const dbName = 'universal-sales'
const mongoClient = new MongoClient(url)

const GoogleAPIKey = 'AIzaSyCwdYmAD3lXNUA7VOE7WnnelwudTDdnRD8'
const options = {
  provider: 'google',

  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: GoogleAPIKey, // for Mapquest, OpenCage, Google Premier
  formatter: null, // 'gpx', 'string', ...
}

const geocoder = NodeGeocoder(options)

// clear()
/* console.log(
  chalk.yellow(
    figlet.textSync('Geo Coordinates', { horizontalLayout: 'default', verticalLayout: 'default' })
  )
) */

// console.log('AddressModel: ', AddressModel)

const q = { $or: [{ location: { $eq: null } }, { 'location.type': '' }, { 'location.coordinates': [] }] }
mongoClient.connect((err, client) => {
  const db = client.db(dbName)

  // const skip = 0 * 100
  const col = db.collection('addresses')
  col.find(q).limit(100).each((_, doc) => {
    if (doc) {
      const fPostalCode = fmtPostalCode(doc.postalCode)

      const addressStr = `${doc.street1} ${doc.city}`
      console.log('addressStr:', addressStr)
      geocoder.geocode(addressStr, (error, res) => {
        if (error) {
          console.log('error:', error)
          return
        }
        if (res && res[0]) {
          const geo = res[0]
          // console.log('geo:', geo)
          const location = {
            type: 'Point',
            coordinates: [geo.longitude, geo.latitude]
          }
          const geoParts = geo.formattedAddress.split(', ')
          const street1 = geoParts[0]
          // const street1 = geo.streetNumber && geo.streetName ? `${geo.streetNumber} ${geo.streetName}` : doc.street1
          const postalCode = geo.zipcode || fPostalCode || doc.postalCode
          console.log('street1:', street1, doc._id)
          col.findOneAndUpdate({ _id: doc._id },
            {
              $set: {
                city: geo.city,
                street1,
                postalCode,
                location,
              },
              $currentDate: { updatedAt: true },
            },
            { returnOriginal: false },
            (retErr, ret) => {
              if (retErr) {
                console.log('err:', retErr)
              }
              console.log('ret:', ret.lastErrorObject)
            })
        }
      })
    } else {
      // client.close()
      // return false
    }
  })
})
