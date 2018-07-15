import express from 'express'
const MongoClient = require('mongodb').MongoClient

import { red, yellow } from '../logger'
const router = express.Router()

const executeAggregate = async (query) => {

  const url = 'mongodb://localhost:27017'
  const database = 'crunchbase'
  const collection = 'companies'
  const client = await MongoClient.connect(url, { useNewUrlParser: true })
  const db = await client.db(database)
  const ret = await db.collection(collection).aggregate(query).toArray()
  return ret
}

// CORRECT ANSWER
router.get('/', async (req, res) => {
  
  const match1 = {
    $match: { 'founded_year': 2004  }
  }
  const project1 = {
    $project: {
      _id: 0,
      name: 1,
      founded_year: 1,
      rounds: { $size: '$funding_rounds' },
      'funding_rounds.raised_amount': 1,
    }
  }

  const match2 = {
    $match: { rounds: { $gt: 4 } } 
  }

  const sort1 = {
    $sort: { rounds: 1 }
  }

  const unwind1 = { 
    $unwind: '$funding_rounds'
  }

  const group1 = {
    $group: {
      _id: '$name',
      averageRaised: { $avg: '$funding_rounds.raised_amount' }
    }
  }

  const sort2 = {
    $sort: { averageRaised: 1 }
  }

  const q = [
    match1,
    project1,
    match2,
    sort1,
    unwind1,
    group1,
    sort2,
  ]

  const ret = await executeAggregate(q)
  res.send(JSON.stringify({ret}))
})

export default router

