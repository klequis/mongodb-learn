import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import {greenf, redf, yellow} from '../logger'
import hw71A from '../routes/hw71A'
require('dotenv').config()

// green('node env=', process.env.NODE_ENV)
const app = express()
const port = process.env.PORT

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(morgan('dev'))

// routes
app.use('/hw71A', hw71A)

app.get('/', (req, res) => {
  redf('Invalid endpoint!')
  res.send('Invalid endpoint!')
})

app.listen(port, () => {
  greenf('server started - ', port)
})

export default app
