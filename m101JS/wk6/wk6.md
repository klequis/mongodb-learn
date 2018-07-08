#Stages
- $addFields
- $bucket
- $bucketAuto
- $colStats
- $count
- $facet
- $geoNear
- $graphLookup
- $group
- $indexStats
- $limit
- $listSessions
- $lookup
- $match
- $out
- $project
- $redact
- $replaceRoot
- $sample
- $skip
- $sort
- $sortByCount
- $unwind




Analytics tools
reports & analysis

pipeline

documents pass through the pipeline one at a time

- stages can be paramatized often in the form of 'operators'
- the same type of stage may appear more than once, e.g., filtering

# Familiar Aggregation Operators
- match (find)
  - filtering like find
- project
- sort
- skip
- limit

These stages (and more) support the aggregation pipeline

BSON Document Size limit applies to result size (16MB)

Pipeline stages have a limit of 100 megabytes of RAM. If a stage exceeds this limit, MongoDB will produce an error. To allow for the handling of large datasets, use the allowDiskUse option to enable aggregation pipeline stages to write data to temporary files.

## Match
```js
db.companies.aggregate([
  { $match: { founded_year: 2004 }},
])
```
## Project
```js
db.companies.aggregate([
  { $match: { founded_year: 2004 }},
  { $project: {
    _id: 0,
    name: 1,
    founded_year: 1
  }}
])
```
## Limit
```js
db.companies.aggregate([
  { $match: { founded_year: 2004 }},
  { $limit: 5 },
  { $project: {
    _id: 0,
    name: 1,
    founded_year: 1
  }}
])
```

## Sort
```js
db.companies.aggregate([
  { $match: { founded_year: 2004 }},
  { $sort: { name: 1} },
  { $limit: 5 },
  { $project: {
    _id: 0,
    name: 1,
    founded_year: 1
  }}
])
```

## Skip
```js
db.companies.aggregate([
  { $match: { founded_year: 2004 }},
  { $sort: { name: 1} },
  { $skip: 10 },
  { $limit: 5 },
  { $project: {
    _id: 0,
    name: 1,
    founded_year: 1
  }}
])
```