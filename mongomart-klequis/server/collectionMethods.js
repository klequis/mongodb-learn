import { green, red, yellow } from '../logger'

const MongoClient = require('mongodb').MongoClient

const database = 'mongomart'
const url = 'mongodb://localhost:27017'

export const find = async (collectionName, query) => {
  green('** find', `collectionName:${collectionName}, query:${query}`)
  const options = { useNewUrlParser: true }
  try {
    const client = await MongoClient.connect(url, options)
    const db = await client.db(database)
    return db.collection(collectionName).find(query) // .toArray()
  } catch (e) {
    red('collectionMethods.find', e)
  }
  
}

export const update = async (collectionName, _id, query) => {
  const options = { useNewUrlParser: true }
  try {
    const client = await MongoClient.connect(url, options)
    const db = await client.db(database)
    // @ts-ignore
    const ret0 = await db.collection(collectionName).update(
      {_id: _id},
      query
    )
    const ret1 = ret0.result
    yellow('ret', ret1)
    return ret1
  }
  catch (e) {
    red('collectionMethods.update', e)
  }
  
}
