import config from './config/config'
import mongoose from './mongo/connect'
import Handler from './handler/handler'

const thundra = require('@thundra/core')({
  apiKey: '8b0908a6-137e-4147-ab99-0b4348d40c10',
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
