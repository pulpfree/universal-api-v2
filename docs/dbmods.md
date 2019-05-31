# DB Modifications

``` bash
db.customers.updateMany({'name.spouse': null}, {$set: {'name.spouse': ''}})

db.customers.updateMany({notes: null}, {$set: {notes: ''}})

db.quotes.updateMany({'quotePrice.outstanding': 0, invoiced: true, closed: false}, {$set: {closed: true}})

db.quotes.updateMany({invoiced: false, 'quotePrice.outstanding': { $gt: 0}}, {$set: {'quotePrice.outstanding': 0}})

db['jobsheet-win-grps'].updateMany({'specs.groupID': { $ne: null}}, { $unset: {'specs.groupID': 1, 'specs.groupType': 1}})

```