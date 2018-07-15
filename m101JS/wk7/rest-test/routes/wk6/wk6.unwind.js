import express from 'express'
const MongoClient = require('mongodb').MongoClient

import { red, yellow } from '../logger'
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const url = 'mongodb://localhost:27017'
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
    const db = await client.db('crunchbase')
    
    const ret = await db.collection('companies').find({}).toArray()
    res.send(JSON.stringify({ret}))
  } catch (e) {
    red('ERROR: ', e)
  }
  
})

const executeAggregate = async (query) => {
  const url = 'mongodb://localhost:27017'
  const client = await MongoClient.connect(url, { useNewUrlParser: true })
  const db = await client.db('crunchbase')
  const ret = await db.collection('companies').aggregate(query).toArray()
  return ret
}

router.get('/unwind-m01s28', async (req, res) => {
  /*
      Why match twice?
      The first $match finds all companies that have a funding round where greylock was a funder 
      in one or more rounds. This can and does bring back docs/rounds that don't have greylock
      as a funder. The second $match filters these funding rounds out.
  */
  const match = { $match: {'funding_rounds.investments.financial_org.permalink': 'greylock' } }
  const unwind1 = { $unwind: '$funding_rounds'}
  const unwind2 = { $unwind: '$funding_rounds.investments'}
  const project = { $project: {
    _id: 0,
    name: 1,
    fundingOrganization: '$funding_rounds.investments.financial_org.permalink',
    amount: '$funding_rounds.raised_amount',
    year: '$funding_rounds.funded_year'
  } }

  const q = [
    match,
    unwind1,
    unwind2,
    match,
    project,
    
    
  ]
  const ret = await executeAggregate(q)
  // const funder = 'greylock'
  const funder = 'sv-angel'
  // const ret2 = ret.filter(r => r.fundingOrganization.includes(funder))
  res.send(JSON.stringify({ret}))
})



router.get('/companies', async (req, res) => {
  const q = [
    { $match: {'funding_rounds.investments.financial_org.permalink': 'greylock' } },
    { $project: {
        _id: 0, 
        name: 1,
        founded: {
            year: '$founded_year',
            month: '$founded_month',
            day: '$founded_day'
        }
    } }
  ]
  try {
    // const url = 'mongodb://localhost:27017'
    // const client = await MongoClient.connect(url, { useNewUrlParser: true })
    // const db = await client.db('crunchbase')
    
    // const ret = await db.collection('companies').aggregate(q).toArray()
    const ret = await executeAggregate(q)
    yellow('ret', ret)
    res.send(JSON.stringify({ret}))
  } catch (e) {
    red('ERROR: ', e)
  }
  
})


export default router


/* Reference
  https://stackoverflow.com/questions/47662220/db-collection-is-not-a-function-when-using-mongoclient-v3-0
*/