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


// CORRECT ANSWER
router.get('/', async (req, res) => {
  // const person =  'josh-stein' //14
  // const person = 'sridhar-vembu'
  // const person = 'roger-ehrenberg' //16
  // const person = 'tim-hanlon' // 29
  const person = 'eric-di-benedetto'

  const match1 = { 
    $match: { 'relationships.person.permalink': person } 
  }
  const project2 = {
    $project: {
      _id: 0,
      name: 1,
      relationships: {
        $filter: {
          input: '$relationships',
          as: 'relation',
          cond: { $eq: ['$$relation.person.permalink', person] }
        }
        
      }
    }
  }
  const group1 = {
    $group: {
      // _id: '$relationships.person.permalink',
      _id: '$name',
      count: { $sum: 1 }
    }
  }

  const q = [ 
    match1,
    project2,
    group1,
  ]

  const ret = await executeAggregate(q)
  res.send(JSON.stringify({ret}))
})


router.get('/one', async (req, res) => {

  const person =  'josh-stein'
  // const person = 'sridhar-vembu'

  const match1 = { 
    $match: { 'relationships.person.permalink': person } 
  }
  
  const unwind1 = {
    $unwind: '$relationships',
  }

  const projectx = {
    $project: { // 1661
      name: 1,
      permalink: '$relationships.person.permalink',
    }
  }

  const project1 = {
    $project: {
      relationships: 1,
      _id: 0,
    }
  }

  const project2 = {
    $project: {
      'relationships.person.permalink': 1
    }
  }

  const project2a = {
    $project: {
      relationships: {
        input: '$relationships',
        as: 'relation',
        cond: {$eq: [ 'relation.person.permalink', person ] }
      }
      
    }
  }

  const match2 = {
    $match: {'relationships.person.permalin': person}
  }

    const q = [ 
    match1,
    project1,
    unwind1,
    // project2a,
    // match2
  ]
  

  const ret = await executeAggregate(q)
  res.send(JSON.stringify({ret}))
})












router.get('/one', async (req, res) => {
  // const person = 'sridhar-vembu'
  // const person = 'roger-ehrenberg' // expected 16, got 16
  const person = 'josh-stein'
  const match1 = { 
    $match: { 'relationships.person.permalink': person } 
  }
  
  const unwind1 = {
    $unwind: '$relationships',
  }

  const project1 = { 
    $project: {
      name: 1,
      company: { $toLower: '$name' },
      permalink: '$relationships.person.permalink',
      person: {
        $filter: {
          input: '$relationships',
          as: 'targetPerson',
          cond: { $eq: ['$$targetPerson', person]}
        }
      }
      
      // 'relationships.person.permalink': 1,
    }
  }

  const sort1 = {
    $sort: {
      company: 1
    }
  }

  const q = [ 
    match1,
    unwind1,
    project1,
    sort1
  ]
  

  const ret = await executeAggregate(q)
  res.send(JSON.stringify({ret}))
})



export default router

