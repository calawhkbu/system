import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'

export default (user: JwtPayload) => {
  let myParty: any = {}
  for (const party of user.parties) {
    if (party.partyGroupCode === user.selectedPartyGroup.code && party.types.includes('forwarder')) {
      myParty = {
        id: party.id,
        name: party.name,
        erpCode: party.thirdPartyCode.erp
      }
    }
  }
  return {
    boundTypeCode: 'O',
    shipmentParty: {
      officeParty: myParty,
      officePartyId: myParty.id,
      officePartyName: myParty.name,
    }
  }
}
