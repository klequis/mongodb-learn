import { find, update } from './collectionMethods'
import { aggregate } from './aggregatFunctions'
import { prepend } from 'ramda'

import { green, red, yellow } from '../logger'

/*
    - Gray Hooded Sweatshirt,
    - Coffee Mug
    - Stress Bakk
    - Track Jacket
    - Women-s T-Shirt
*/

export const addReview = async (itemId, comment, name, stars) => {
  green('** items.addReview')
  const review = {
    name,
    comment,
    stars,
    date: new Date()
  }
  const q = { $push: { reviews: review } }
  const result = update('item', itemId, q)
}

export const getRelatedItems = async () => {
  green('** items.getRelatedItems')
  const q = {}
  const docs = await find('item', q)
  const dLimit = await docs.limit(4)
  return dLimit
}

export const getItem = async (_id) => {
  green('** items.getItem')
  const q = { _id: _id }
  const docs = await find('item', q)
  return docs.toArray()
}

export const searchItems = async (query, page, itemsPerPage) => {
  green('** items.searchItems')
  // red('**searchItems')
  // red('query', query)
  // red('page', page)
  // red('skip amount', page * itemsPerPage)
  // db.item.find({ $text: { $search: "top" } }).toArray()
  const q = { $text: { $search: query } }
  const docs = await find('item', q)
  const allDocsSorted = await docs.sort( { _id: 1 } )
  const docsLimit = await allDocsSorted.limit(itemsPerPage)
  const docsSkip = await docsLimit.skip(page * itemsPerPage)
  const returnDocs = await docsSkip.toArray()
  
  // yellow('returnDocs', returnDocs)
  return returnDocs
  
}

export const getNumSearchItems = async (query) => {
  green('** items.getNumSearchItems')
  const q = { $text: { $search: query } }
  const docs = await find('item', q)
  const count = await docs.count()
  // yellow('getNumSearchItems: count', count)
  return count
}

export const getNumItems = async (category) => {
  green('** items.getNumItems')
  try {
    
    let q = {}
    if (category !== 'All') {
      q = {'category': category}
    } 
    const docs = await find('item', q)
    const count = await docs.count()
    // yellow('count', count)
    return count
    
  } catch (e) {
    red('getItems', e)
  } 
}

export const getItems = async (category, page, itemsPerPage) => {
  green('** items.getItems')
  // category = 'Apparel'
  // page = 1
  // itemsPerPage = 5
  // yellow('category', category)
  // yellow('page', page)
  // yellow('itemsPerPage', itemsPerPage)
  // red('skip amount', page * itemsPerPage)

  try {
    
    let q = {}
    if (category !== 'All') {
      q = {'category': category}
    } 
    const allDocs = await find('item', q)
    const allDocsSorted = await allDocs.sort( { _id: 1 } )
    const docsLimit = await allDocsSorted.limit(itemsPerPage)
    const docsSkip = await docsLimit.skip(page * itemsPerPage)
    const returnDocs = await docsSkip.toArray()
    //yellow('returnDocs', returnDocs)

    return returnDocs
    
  } catch (e) {
    red('getItems', e)
  }
  
}

export const getCategories = async () => {
  green('** items.getCategories')
  const group1 = {
    $group: {
      _id: '$category',
      num: { $sum: 1 }
    }
  }
  
  const q = [
    group1
  ]
  const categories = await aggregate('item', q)
  
  // get count of items
  let allItemCount = 0
  categories.forEach(c => {
    allItemCount += c.num
  })

  // final returned array
  const all = {'_id': 'All', num: allItemCount}
  const final0 = prepend(all, categories)
  // yellow('final0', final0)

  // sort by category name
  const final1 = final0.sort((a, b) => {
    return a._id > b._id ? 1 : -1
  })
  // yellow('final1', final1)
  return final1
}


