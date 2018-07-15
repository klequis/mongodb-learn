import { ObjectID } from 'mongodb'

export const isValidObjectID = (id) => {
  return ObjectID.isValid(id)
}

export default { isValidObjectID }
