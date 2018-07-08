import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import {greenf, redf, yellow} from '../logger'
import unwind from '../routes/unwind'
import arrayExpressions from '../routes/array-expressions'
import hw61 from '../routes/hw-6-1'
import hw62 from '../routes/hw-6-2'
import hw63 from '../routes/hw-6-3'
import filter from '../routes/filter'
// import '../config'
require('dotenv').config()


// green('node env=', process.env.NODE_ENV)
const app = express()
const port = process.env.PORT


app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(morgan('dev'))
app.use('/unwind', unwind)
app.use('/array-expressions', arrayExpressions)
app.use('/hw-6-1', hw61)
app.use('/hw-6-2', hw62)
app.use('/hw-6-3', hw63)
app.use('/filter', filter)

app.get('/', (req, res) => {
  redf('Invalid endpoint!')
  res.send('Invalid endpoint!')
})

app.listen(port, () => {
  greenf('server started - ', port)
})

export default app
