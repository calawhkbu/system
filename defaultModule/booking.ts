import { Person } from 'models/main/Person'

export default (user: Person) => {
  console.log(user)
  return {
    boundTypeCode: 'O'
  }
}
