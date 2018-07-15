import express from 'express'
const MongoClient = require('mongodb').MongoClient

import { red, yellow } from '../logger'
const router = express.Router()

const executeAggregate = async (query) => {

  const url = 'mongodb://localhost:27017'
  const database = 'test'
  const collection = 'grades'
  const client = await MongoClient.connect(url, { useNewUrlParser: true })
  const db = await client.db(database)
  const ret = await db.collection(collection).aggregate(query).toArray()
  return ret
}

// CORRECT ANSWER
router.get('/', async (req, res) => {
  
  const unwind1 = {
    $unwind: '$scores'
  }

  const match2 = {
    $match: {
      'scores.type': { $ne: 'quiz' }
    }
  }

  const project2 = {
    $project: {
      _id: 0,
      class_id: 1,
      grade: '$scores.score'
    }
  }
  const sort1 = {
    $sort: { 'class_id': 1}
  }
  const group2 = {
    $group: {
      _id: '$class_id',
      classAverage: { $avg: '$grade'}
    }
  }
  const sort2 = {
    $sort: { 'classAverage': 1 }
  }

  const q = [
    unwind1,
    match2,
    project2,
    sort1,
    group2,
    sort2,
  ]

  const ret = await executeAggregate(q)
  res.send(JSON.stringify({ret}))
})

router.get('/one', async (req, res) => {
  const project1 = {
    $project:{
      _id:1,
      student_id:1,
      class_id:1,
      scores:{
        $filter:{
          input:'$scores',
          as:'scores',
          cond:{$eq:['$$scores.type', 'exam']} 
        }
      }
    }
  }
  
  const group1 =  {
    $group: {
      _id: '$class_id',
      'average': {
          $avg: '$scores.score'
      },
      'stud': { 
          $push: {
              'student_id': '$student_id', 
              'marks': '$scores.score' 
          }
      }
    }
  }
  const sort1 = { $sort: { 'average': -1 }}
  const limit1 = { $limit: 1 }
  const project2 = { 
    $project: { 
      'Average Marks': '$average', 
      'students_higher': { 
          $filter: { 
              input: '$stud', 
              as: 'st',   
              cond: { $gt: ['$$st.marks', '$average']} 
          }   
      }
    }
  }
  const q = [ 
    project1, // 200
    // group1,
    // sort1,
    // limit1,
    // project2
  ]

  const ret = await executeAggregate(q)
  res.send(JSON.stringify({ret}))
})






export default router

