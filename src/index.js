import config from './config/config'
import mongoose from './mongo/connect'
import Handler from './handler/handler'

const thundra = require('@thundra/core')({
  apiKey: 'b41775a3-4be7-4bbc-8106-ef649370ad63',
})

let db
let cfg

exports.handler = thundra(async (event) => {
  if (!db) {
    cfg = await config.load()
    db = await mongoose.connect(cfg)
  }
  console.log("Received event - arguments:", JSON.stringify(event, 3)); // eslint-disable-line

  return Handler(event, cfg)
})
