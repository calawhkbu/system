import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'

export default (user: JwtPayload) => {
  let myParty: any = null

  for (const party of user.parties) {
    if (party.partyGroupCode === user.selectedPartyGroup.code && (party.types.includes('forwarder') || party.types.includes('office')) ) {
      myParty = {
        id: party.id,
        name: party.name,
        erpCode: party.thirdPartyCode.erp
      }
      break
    }
  }

  const result = {
    billTypeCode: 'H',
    // boundTypeCode: 'O',
    shipmentParty: {

      ...(myParty ? ({
        officePartyCode : myParty.erpCode,
        officeParty: myParty,
        officePartyId: myParty.id,
        officePartyName: myParty.name,
      }) : {})

    }
  }

  // console.log(`resultresult`)
  // console.log(result)
  return result
}
