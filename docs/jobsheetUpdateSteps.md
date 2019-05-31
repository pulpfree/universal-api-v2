# Steps to update jobsheet schema and db records

1. download latest db
1. run mongoScripts.groupTypeMods.js
1. run jobsheetNums.js
1. update quote-meta with last number of jobsheet number
1. cp jobsheet, jobsheet-win-grps, quote-meta to live db