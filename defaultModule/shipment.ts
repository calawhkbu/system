import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'

export default (user: JwtPayload) => {

  console.log(`useruseruser`)
  console.log(user)
  let myParty: any = {}
  for (const party of user.parties) {
    if (party.partyGroupCode === user.selectedPartyGroup.code && (party.types.includes('forwarder') || party.types.includes('office')) ) {
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
      officePartyCode : myParty.erpCode,
      officeParty: myParty,
      officePartyId: myParty.id,
      officePartyName: myParty.name,
    }
  }
}
