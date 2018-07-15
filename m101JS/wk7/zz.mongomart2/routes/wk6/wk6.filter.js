import express from 'express'
const MongoClient = require('mongodb').MongoClient

import { red, yellow } from '../logger'
const router = express.Router()

const dbName = 'docExamples'
const collectionName = 'aggFilter'

const executeAggregate = async (query) => {
  const url = 'mongodb://localhost:27017'
  const client = await MongoClient.connect(url, { useNewUrlParser: true })
  const db = await client.db(dbName)
  const ret = await db.collection(collectionName).aggregate(query).toArray()
  return ret
}

router.get('/', async (req, res) => {
  
  const q = [
    {
       $project: {
          items: {
             $filter: {
                input: '$items',
                as: 'item',
                cond: { $gte: [ '$$item.price', 100 ] }
             }
          }
       }
    }
 ]
  

  const ret = await executeAggregate(q)
  res.send(JSON.stringify({ret}))
})

export default router

