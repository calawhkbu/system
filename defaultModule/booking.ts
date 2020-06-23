import { JwtPayload, JwtPayloadParty } from 'modules/auth/interfaces/jwt-payload'

const convertToPartyOfBookingParty = (
  party: JwtPayloadParty,
  type: string
) => {
  return {
    [`${type}Party`]: {
      id: party.id,
      name: party.name,
      thirdPartyCode: {
        erp: party.erpCode
      },
      erpCode: party.erpCode,
      shortName: party.shortName,
      groupName: party.groupName,
      fax: party.fax,
      phone: party.phone,
      email: party.email,
      identity: party.identity,
      address: party.address,
      cityCode: party.cityCode,
      stateCode: party.stateCode,
      countryCode: party.countryCode,
      zip: party.zip
    },
    [`${type}PartyCode`]: party.erpCode,
    [`${type}PartyId`]: party.id,
    [`${type}PartyName`]: party.name,
    [`${type}PartyAddress`]: party.address,
    [`${type}PartyCityCode`]: party.cityCode,
    [`${type}PartyStateCode`]: party.stateCode,
    [`${type}PartyCountryCode`]: party.countryCode,
    [`${type}PartyZip`]: party.zip
  }
}

const mainParties = ['shipper', 'consignee', 'roAgent', 'linerAgent', 'agent', 'controllingCustomer', 'notifyParty']

export default (user: JwtPayload) => {
  let bookingParty: any = {}


  const isInternalUser = user.parties.reduce((answer: boolean, party: JwtPayloadParty) => {
    if (!answer) {
      return party.types.includes('forwarder') || party.types.includes('office')
    }
    return answer
  }, false)
  if (isInternalUser) { // internal User
    for (const party of user.parties) {
      if (party.partyGroupCode === user.selectedPartyGroup.code && !bookingParty['forwarderPartyId']) {
        const isForwarder = party.types.includes('forwarder') || party.types.includes('office')
        if (isForwarder) {
          bookingParty = {
            ...bookingParty,
            ...convertToPartyOfBookingParty(party, 'forwarder')
          }
        }
      }
    }
  } else { // external party
    let selectedParty = user.parties.find(party => {
      const defaultType = party.defaultType || party.types[0]
      return defaultType && mainParties.includes(defaultType)
    })
    if (!selectedParty) {
      selectedParty = user.parties[0]
    }
    const defaultType = selectedParty.defaultType || selectedParty.types[0]
    if (mainParties.includes(defaultType)) {
      bookingParty = {
        ...bookingParty,
        ...convertToPartyOfBookingParty(selectedParty, defaultType)
      }
    } else {
      bookingParty = {
        ...bookingParty,
        flexData: {
          moreParty: [defaultType],
          ...convertToPartyOfBookingParty(selectedParty, defaultType)
        }
      }
    }
  }
  return {
    boundTypeCode: 'O',
    bookingParty: bookingParty,
    bookingDate: {}
  }
}
