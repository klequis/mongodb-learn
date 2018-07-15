import { red, yellow } from '../logger'

const MongoClient = require('mongodb').MongoClient

const database = 'mongomart'
const url = 'mongodb://localhost:27017'

export const aggregate = async (collectionName, query) => {
  const client = await MongoClient.connect(url)
  const db = await client.db(database)
  const ret = await db.collection(collectionName).aggregate(query).toArray()
  return ret
}