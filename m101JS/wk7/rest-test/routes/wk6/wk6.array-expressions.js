import express from 'express'
const MongoClient = require('mongodb').MongoClient

import { red, yellow } from '../logger'
const router = express.Router()

const executeAggregate = async (query) => {
  const url = 'mongodb://localhost:27017'
  const client = await MongoClient.connect(url, { useNewUrlParser: true })
  const db = await client.db('crunchbase')
  const ret = await db.collection('companies').aggregate(query).toArray()
  return ret
}

router.get('/', async (req, res) => {
  
  const match1 = { 
    $match: { 'founded_year': 2010 } 
  }
  
  const project1 = { 
    $project: {
      _id: 0,
      name: 1,
      founded_year: 1,
      first_round: { $arrayElemAt: [ '$funding_rounds', 0 ] },
      last_round: { $arrayElemAt: [ '$funding_rounds', -1 ] }
    }
  }

  const project2 = { 
    $project: {
      _id: 0,
      name: 1,
      founded_year: 1,
      early_rounds: { $slice: [ '$funding_rounds', 1, 3 ] }
    }
  }

  // const q = [ 
  //   match1,
  //   project2,
  // ]
  const q = [
    { $match: { 'founded_year': 2004 } },
    { $project: {
        _id: 0,
        name: 1,
        founded_year: 1,
        total_rounds: { $size: '$funding_rounds' }
    } }
  ]

  const ret = await executeAggregate(q)
  res.send(JSON.stringify({ret}))
})

router.get('/one', async (req, res) => {
  
  const match1 = { $match: {'funding_rounds.investments.financial_org.permalink': 'greylock' } }
  
  const project = { 
      $project: {
      _id: 0,
      name: 1,
      founded_year: 1,
      rounds: { $filter: {
            input: '$funding_rounds',
            as: 'round',
            cond: { $gte: ['$$round.raised_amount', 100000000] } 
          } 
        }
      } 
  }

  const match2 = {
    $match: {'rounds.investments.financial_org.permalink': 'greylock' }
  }

  const q = [ 
    match1,
    project,
    match2
  ]

  const ret = await executeAggregate(q)
  res.send(JSON.stringify({ret}))
})

export default router


/* Reference
  https://stackoverflow.com/questions/47662220/db-collection-is-not-a-function-when-using-mongoclient-v3-0
*/