import { Person } from 'models/main/person'

export default (user: Person) => {
  console.log(user)
  return {
    boundTypeCode: 'O',
    forwarderParty: {
      id: 1,
      name: 'Development Team',
    },
    forwarderPartyId: 1,
    forwarderPartyName: 'Development Team',
  }
}
