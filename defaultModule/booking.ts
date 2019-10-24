import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'

export default (user: JwtPayload) => {
  let myParty: any = {}
  for (const party of user.parties) {
    if (party.partyGroupCode === user.selectedPartyGroup.code) {
      if (party.types.includes('forwarder')) {
        console.log(party, 'test')
        myParty = {
          id: party.id,
          name: party.name,
          erpCode: party.thirdPartyCode.erp
        }
        break
      }
    }
  }
  return {
    boundTypeCode: 'O',
    forwarderParty: myParty,
    forwarderPartyId: myParty.id,
    forwarderPartyName: myParty.name,
  }
}
