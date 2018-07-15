import { green, red, yellow } from '../logger'

export const cartTotal = (userCart) => {
  green('** cartTotal', `userCart: ${userCart}`)
  yellow('userCart', userCart)
  let total = 0
  for (var i=0; i<userCart.items.length; i++) {
      let item = userCart.items[i]
      total += item.price * item.quantity
  }

  return total
}