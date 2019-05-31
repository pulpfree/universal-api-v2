# Geospatial Queries

Create index  
`db.addresses.createIndex({ location: "2dsphere" })`

query below works to find 47 Northgate Dr  
`db.addresses.find({ location: { $nearSphere: { $geometry: { type: "Point", coordinates: [ -79.2576469, 43.0095132 ] }, $maxDistance: 5000 } }, associate: 'jobsheet' }).pretty()`