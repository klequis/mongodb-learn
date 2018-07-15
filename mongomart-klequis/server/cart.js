import { find, update } from './collectionMethods'
import { green, red, yellow } from '../logger'

export const getCart = async (userId) => {
  green('** getCart', `userId=${userId}`)
  const q = { userId: userId }
  const doc = await find('cart', q)
  const r0 = await doc.toArray()
  const r1 = r0[0]
  // const items = r1.items
  // items.forEach(i => {
  //   yellow('item', `title=${i.title}, price=${i.price}}`)
    
  // })
  // yellow('items', items)
  return r1
}