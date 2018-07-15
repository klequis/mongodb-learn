import { ObjectID } from 'mongodb'

export const isValidObjectID = (id) => {
  return ObjectID.isValid(id)
}

export const object_idFromHex = (hex_id) => {
  return ObjectID.createFromHexString(hex_id)
}

export default { isValidObjectID }
