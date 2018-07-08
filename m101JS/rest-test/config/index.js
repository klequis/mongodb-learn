import { greenf, yellow } from '../logger'
require('dotenv').config()

const env = process.env.NODE_ENV
yellow('config.env', env)

if (!env) {
  process.env.NODE_ENV = 'development'

}

if(env === 'development') {
  greenf('environment = ', process.env.NODE_ENV)
  process.env.PORT = 3030
  process.env.MONGODB_URI = process.env.MONGODB_URI_DEV
} else if(env === 'test') {
  greenf('environment = ', process.env.NODE_ENV)
  process.env.PORT = 3030
  process.env.MONGODB_URI = process.env.MONGODB_URI_TEST
} else if(env === 'production') {
  greenf('environment = ', process.env.NODE_ENV)
} else {
  redf('server.index.js: unknown NODE_ENV')
}
