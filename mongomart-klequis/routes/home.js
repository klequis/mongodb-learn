import express from 'express'
const MongoClient = require('mongodb').MongoClient
import { getItems, 
  getCategories, 
  getNumItems, 
  searchItems, 
  getNumSearchItems, 
  getItem, 
  getRelatedItems, 
  addReview 
} from '../server/items'
import { getCart } from '../server/cart'
import { cartTotal } from './helpers'
import { green, red, yellow } from '../logger'

const router = express.Router()
const ITEMS_PER_PAGE = 5
const USERID = '558098a65133816958968d88'

router.get('/cart', function(req, res) {
  res.redirect('/user/' + USERID + '/cart')
})

router.get('/user/:userId/cart', async (req, res) => {

  var userId = req.params.userId
  const userCart = await getCart(userId)
  // yellow('userCart', userCart)
  const total = cartTotal(userCart)
  // yellow('total', total)
  res.render('cart',
  {
      userId: userId,
      updated: false,
      cart: userCart,
      total: total
  })
  
})

router.post('/item/:itemId/reviews', async (req, res) => {
  green('** home', 'POST /item/:itemId/reviews')
  const itemId = parseInt(req.params.itemId)
  const review = req.body.review
  const name = req.body.name
  const stars = parseInt(req.body.stars)
  const items = await addReview(itemId, review, name, stars)
  res.redirect('/item/' + itemId)
})


router.get('/item/:itemId', async (req, res) => {
  green('** home', 'GET /item/:itemId')
  var itemId = parseInt(req.params.itemId)

  const a = await getItem(itemId)
  const item = a[0]
  // yellow('item', item)
  if (item == null) {
    res.status(404).send('Item not found.')
    return
  }
  let stars = 0
  let numReviews = 0
  let reviews = []

  if ('reviews' in item) {
    // yellow('** reviews in items')
    numReviews = item.reviews.length

    for (var i=0; i<numReviews; i++) {
        var review = item.reviews[i]
        stars += review.stars
    }

    if (numReviews > 0) {
        stars = stars / numReviews
        reviews = item.reviews
    }
  }

  const relatedItems = await getRelatedItems()
  res.render('item',
    {
        userId: USERID,
        item: item,
        stars: stars,
        reviews: reviews,
        numReviews: numReviews,
        relatedItems: relatedItems
    }
  )
  
})

router.get('/search', async (req, res) => {
  green('** home', 'GET /search')
  let page = 0
  if (typeof req.query.page === 'undefined') {
    page = 0
  } else {
    page = req.query.page
  }
  var query = req.query.query ? req.query.query : ''
  
  const items = await searchItems(query, page, ITEMS_PER_PAGE)
  // items.forEach(r => {
  //   yellow('r', `_id:${r._id}: ${r.title}`)
  // })
  const itemCount = await getNumSearchItems(query)
  // yellow('/search: itemCount', itemCount)
  let numPages = 0
  if (itemCount > ITEMS_PER_PAGE) {
    numPages = Math.ceil(itemCount / ITEMS_PER_PAGE)
  }
  // yellow('queryString', query)
  // yellow('itemCount', itemCount)
  // yellow('pages', numPages)
  // yellow('items')
  

  // yellow('query', query)
  
  // yellow('numPages', numPages)
  res.render('search', { 
    queryString: query,
    itemCount: itemCount,
    pages: numPages,
    page: page,
    items: items
  })
})

router.get('/', async (req, res) => {
  green('** home', 'GET /')
  let page = 1
  page = 0
  if (typeof req.query.page === 'undefined') {
    page = 0
  } else {
    page = req.query.page
  }
  
  const category = req.query.category ? req.query.category : 'All'

  try {
    const items = await getItems(category, page, ITEMS_PER_PAGE)
    const categories = await getCategories()
    const itemCount = await getNumItems(category)
    // yellow('itemCount', itemCount)
    let numPages = 0
    if (itemCount > ITEMS_PER_PAGE)  {
      numPages = Math.ceil(itemCount / ITEMS_PER_PAGE)
    }
    // yellow('numPages', numPages)
    res.render('home', { 
      category_param: category,
      categories: categories,
      useRangeBasedPagination: false,
      itemCount: itemCount,
      pages: numPages,
      page: page,
      items: items })
  } catch (e) {
    red('/home: get', e)
    res.status(400).send(e)
  }
})

export default router
