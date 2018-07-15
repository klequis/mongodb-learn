import express from 'express'
import bodyParser from 'body-parser'
import nunjucks from 'nunjucks'
// mongoClient?
import assert from 'assert'
import ItemDAO from './PathNotSet'
import CartDAO from './PathNotSet'
import cors from 'cors'
import morgan from 'morgan'
import {greenf, redf, yellow} from '../logger'
require('dotenv').config()

// green('node env=', process.env.NODE_ENV)
const app = express()
const port = process.env.PORT

app.use(cors())
app.set('view engine', 'html')
app.set('views', __dirname + '/views');
app.use('/static', express.static(__dirname + '/static'));
// app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(morgan('dev'))

// nunjucks
const env = nunjucks.configure('views', {
  autoescape: true,
  express: app
})
const nunjucksDate = require('nunjucks-date')
nunjucksDate.setDefaultFormat('MMMM Do YYYY, h:mm:ss a')
env.addFilter('date', nunjucksDate)

const ITEMS_PER_PAGE = 5

// Hardcoded USERID for use with the shopping cart portion
const USERID = "558098a65133816958968d88";

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
