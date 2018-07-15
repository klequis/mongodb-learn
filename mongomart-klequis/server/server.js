import express from 'express'
import bodyParser from 'body-parser'
import nunjucks from 'nunjucks'
import cors from 'cors'
import morgan from 'morgan'
import {greenf, redf, yellow} from '../logger'
import path from 'path'
import home from '../routes/home'

import '../config'
const port = process.env.PORT

// green('node env=', process.env.NODE_ENV)
const app = express()
app.set('view engine', 'html')
const viewsDir = path.join(__dirname, '../views')
app.set('views', __dirname + '/views')
const staticDir = path.join(__dirname, '../static')
app.use('/static', express.static(staticDir))
const env = nunjucks.configure('views', {
  autoescape: true,
  express: app
})

const nunjucksDate = require('nunjucks-date')
nunjucksDate.setDefaultFormat('MMMM Do YYYY, h:mm:ss a')
// @ts-ignore
env.addFilter('date', nunjucksDate)
app.use(bodyParser.urlencoded({ extended: true }));

// var ITEMS_PER_PAGE = 5
// Hardcoded USERID for use with the shopping cart portion
// var USERID = '558098a65133816958968d88'

app.use(cors())
app.use(morgan('dev'))
app.use('/', home)
app.get('/', (req, res) => { 
  redf('Invalid endpoint!')
  res.send('Invalid endpoint!')
})

app.listen(port, () => {
  greenf('server started - ', port)
})

export default app
