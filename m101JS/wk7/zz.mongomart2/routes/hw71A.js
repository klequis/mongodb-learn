import express from 'express'
import { prepend } from 'ramda'

const MongoClient = require('mongodb').MongoClient

import { red, yellow } from '../logger'
const router = express.Router()

const database = 'mongomart'
const collection = 'item'

const executeAggregate = async (query) => {
  const url = 'mongodb://localhost:27017'
  const client = await MongoClient.connect(url, { useNewUrlParser: true })
  const db = await client.db(database)
  const ret = await db.collection(collection).aggregate(query).toArray()
  return ret
}

const executeFind = async (query) => {
  const url = 'mongodb://localhost:27017'
  const client = await MongoClient.connect(url, { useNewUrlParser: true })
  const db = await client.db(database)
  const ret = await db.collection(collection).find(query).toArray()
  return ret
}

router.get('/get-items', async (req, res) => {
  const category = 'All'
  const q = {}
  if (category !== 'All' ) {

  }

  const ret = await executeFind(q)
  
  res.send(JSON.stringify({ret}))
})



router.get('/categories', async (req, res) => {
  const match1 = {
    $match: { category: { $ne: null }}
  }
  const group1 = {
    $group: {
      _id: '$category',
      num: { $sum: 1 },
    }
  }

  const sort1 = {
    $sort: {
      _id: 1,
    }
  }

  const project1 = {
    $project: {
      _id: 1,
      category: 1,

    }
  }
  const q = [
    match1,
    group1,
    sort1
    // project1,
  ]

  const ret = await executeAggregate(q)
  // console.log('ret.length', ret.length)
  // console.log('ret', ret)
  let allNum = 0
  for (let i=0; i<ret.length; i++) {
    allNum = allNum + ret[i].num
  }
  console.log('allNum', allNum)
  const all = {
    _id: 'All',
    num: allNum,
  }
  console.log('ret', ret)
  console.log('all', all)
  let final = prepend(all, ret)
  console.log('')
  console.log('')
  console.log('final', final)
  res.send(JSON.stringify({ret}))
})

export default router


/* Reference
  https://stackoverflow.com/questions/47662220/db-collection-is-not-a-function-when-using-mongoclient-v3-0
*/