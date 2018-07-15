import { yellowf, red, greenf, redf, yellow } from '../logger'

const MongoClient = require('mongodb').MongoClient

const readyState = () => {
  const state = Mongoose.connection.readyState
  switch (state) {
    case 0:
      yellowf('Mongoose: not connected')
      return
    case 1:
      greenf('Mongoose: connected')
      return
    case 2:
      yellowf('Mongoose: connecting')
      return
    case 3:
      yellowf('Mongoose: disconnecting')
      return
    default:
      redf('Mongoose: state unknown')
  }
}

export const connectToMongo = async () => {
  const database = 'mongomart'
  const collection = 'item'
  const url = 'mongodb://localhost:27017'
  try {
    const client = await MongoClient.connect(url, { /*useNewUrlParser: true*/ })
    const db = await client.db(database)
    //const items =  await db.collection('item').find({}).toArray()
    
    // yellow('items', items)
    return db
  } catch (e) {
    red('connectToMongo', e)
  }
  
}

export default { connectToMongo }
