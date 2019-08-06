import { Person } from 'models/main/person'

export default (user: Person) => {
  console.log(user)
  return {
    boundTypeCode: 'O'
  }
}
